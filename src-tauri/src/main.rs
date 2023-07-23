use chrono::{Local, TimeZone};
use disks::{Disk, DiskKindWrapper};
use entries::Entry;
use rayon::prelude::*;
use serde_json::Value;
use slides::{ImageSlide, Slide, VideoSlide, VideoSource};
use std::{
    fs::read,
    path::Path,
    sync::{Arc, Mutex},
};
use sysinfo::{DiskExt, System, SystemExt};
use tauri::{
    http::status::StatusCode, http::ResponseBuilder, AboutMetadata, CustomMenuItem, Error, Menu,
    MenuItem, State, Submenu,
};

mod disks;
mod entries;
mod slides;

#[derive(Default, Debug)]
struct ActiveFolderItems(Arc<Mutex<Vec<Entry>>>);

#[tauri::command]
async fn disks() -> Result<Vec<Disk>, Error> {
    let mut disks = Vec::new();
    let mut system = System::new_all();
    system.refresh_disks_list();

    for disk in system.disks() {
        let mut disk_details = Disk::new();
        let total_space = disk.total_space() / 1024_u64.pow(3);
        let available_space = disk.available_space() / 1024_u64.pow(3);
        let disk_kind = DiskKindWrapper(disk.kind());

        disk_details.name = Some(disk.name().to_os_string().to_string_lossy().to_string());
        disk_details.mount_point = Some(disk.mount_point().to_string_lossy().to_string());
        disk_details.kind = Some(disk_kind.into());
        disk_details.file_system = Some(
            disk.file_system()
                .to_vec()
                .iter()
                .map(|&c| c as char)
                .collect::<String>(),
        );
        disk_details.total_space = Some(total_space);
        disk_details.available_space = Some(available_space);

        disks.push(disk_details);
    }

    Ok(disks)
}

#[tauri::command]
async fn get_folder_items(
    path: String,
    show_hidden: bool,
    active_folder_items: State<'_, ActiveFolderItems>,
) -> Result<Vec<Entry>, Error> {
    let items = Arc::new(Mutex::new(Vec::new()));
    let paths = std::fs::read_dir(path).unwrap();

    paths.par_bridge().for_each(|path| {
        let mut entry = Entry::new();
        let pathname = path.unwrap().path();
        let metadata = pathname.metadata().unwrap();
        let extension = match pathname.extension() {
            Some(extension) => extension.to_str().unwrap().to_string(),
            None => "".to_string(),
        };
        let size = metadata.len();
        let modified = metadata
            .modified()
            .unwrap()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let converted_time = Local.timestamp_opt(modified as i64, 0).unwrap();
        let current_time = Local::now();
        let time_diff = current_time
            .signed_duration_since(converted_time)
            .num_days();

        let formatted_time = match time_diff {
            diff if diff < 1 => format!("today {}", converted_time.format("%H:%M")),
            diff if diff < 2 => format!("yesterday {}", converted_time.format("%H:%M")),
            _ => format!("{}", converted_time.format("%Y-%m-%d %H:%M")),
        };

        let pathname = pathname.to_str().unwrap().to_string();
        let relative_path = pathname.replace("/System/Volumes/Data/", "");
        let name = pathname.split("/").last().unwrap().to_string();

        entry.extension = Some(extension);
        entry.is_dir = Some(metadata.is_dir());
        entry.is_hidden = Some(name.starts_with("."));
        entry.modified = Some(formatted_time);
        entry.name = Some(name);
        entry.path = Some(pathname);
        entry.request_url = Some(format!("reqmedia://{}", relative_path));
        entry.size = Some(size);

        if !show_hidden && entry.is_hidden.unwrap() {
            return;
        }

        items.lock().unwrap().push(entry);
    });

    items.lock().unwrap().sort_by(|a, b| {
        let a = a.path.as_ref().unwrap();
        let b = b.path.as_ref().unwrap();
        a.cmp(b)
    });

    // add actual items to app state
    *active_folder_items.0.lock().unwrap() = items.lock().unwrap().clone();

    let entries = active_folder_items.0.lock().unwrap().clone();
    Ok(entries)
}

#[tauri::command]
fn generate_slides(active_folder_items: State<'_, ActiveFolderItems>) -> Result<Value, Error> {
    let active_folder_items = active_folder_items.0.lock().unwrap();
    let mut slides = vec![];

    active_folder_items
        .iter()
        .for_each(|item| match item.extension.as_ref().unwrap().as_str() {
            "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" | "tiff" | "ico" | "avif" => {
                let slide = ImageSlide {
                    r#type: "image".to_string(),
                    src: item.request_url.as_ref().unwrap().to_string(),
                };

                slides.push(Slide::Image(slide));
            }
            "mp4" | "ogg" | "ogv" | "webm" => {
                let slide = VideoSlide {
                    r#type: "video".to_string(),
                    sources: vec![VideoSource {
                        src: item.request_url.as_ref().unwrap().to_string(),
                    }],
                };

                slides.push(Slide::Video(slide));
            }
            _ => {}
        });

    Ok(serde_json::json!(slides))
}

fn main() {
    tauri::Builder::default()
        .menu(
            Menu::new()
                .add_submenu(Submenu::new(
                    "App",
                    Menu::new()
                        .add_native_item(MenuItem::About(
                            "About MacFinder".to_string(),
                            AboutMetadata::new()
                                .version("0.1.0")
                                .authors(vec!["Dániel Boros".to_string()])
                                .license("MIT".to_string())
                                .website("https://github.com/dancixx/mac-file-browser".to_string()),
                        ))
                        .add_native_item(MenuItem::Separator)
                        .add_native_item(MenuItem::Quit),
                ))
                .add_submenu(Submenu::new(
                    "View",
                    Menu::new()
                        .add_item(CustomMenuItem::new("showHidden", "Show Hidden Files"))
                        .add_native_item(MenuItem::Separator)
                        .add_native_item(MenuItem::Cut)
                        .add_native_item(MenuItem::Copy)
                        .add_native_item(MenuItem::Paste)
                        .add_native_item(MenuItem::Separator)
                        .add_native_item(MenuItem::SelectAll),
                )),
        )
        .on_menu_event(|event| match event.menu_item_id() {
            "showHidden" => {
                event.window().emit("showHidden", Some(true)).unwrap();
            }
            _ => {}
        })
        .manage(ActiveFolderItems::default())
        .invoke_handler(tauri::generate_handler![
            disks,
            get_folder_items,
            generate_slides
        ])
        // TODO: build media viewer: https://github.com/mar-m-nak/tauri_imgv/blob/main/src-tauri/src/main.rs
        // TODO: to read local files from the app, we need to register a custom protocol
        .register_uri_scheme_protocol("reqmedia", move |_app, request| {
            let res_not_media = ResponseBuilder::new()
                .status(StatusCode::NOT_FOUND)
                .body(Vec::new());

            if request.method() != "GET" {
                return res_not_media;
            };

            let uri = request.uri();
            let file_path = uri.replace("reqmedia://", "/System/Volumes/Data/");
            let encoded_file_path = percent_encoding::percent_decode_str(&file_path)
                .decode_utf8()
                .unwrap();
            let path = Path::new(encoded_file_path.as_ref());

            let local_file = match read(path) {
                Ok(local_file) => ResponseBuilder::new()
                    .status(StatusCode::OK)
                    .body(local_file),
                Err(_) => res_not_media,
            };

            local_file
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
