use async_recursion::async_recursion;
use async_std::task;
use chrono::{Local, TimeZone};
// use disk_index::index_dirs;
use entries::{Entry, FolderData};
use file_system::volumes::get_volumes;
use rayon::prelude::*;
use serde_json::Value;
use slides::{ImageSlide, Slide, VideoSlide, VideoSource};
use sqlx::SqlitePool;
use state::AppState;
use std::{
    env,
    fs::{read, read_dir},
    path::Path,
    sync::{
        atomic::{AtomicU64, AtomicUsize, Ordering},
        Arc, Mutex,
    },
};
use tauri::{
    http::status::StatusCode, http::ResponseBuilder, AboutMetadata, CustomMenuItem, Error, Manager,
    Menu, MenuItem, State, Submenu,
};
use tracing::debug;

mod database;
mod disk_index;
mod entries;
mod file_system;
mod slides;
mod state;

#[derive(Default, Debug)]
struct ActiveFolderItems(Arc<Mutex<FolderData>>);

#[tauri::command]
async fn get_dir_items(
    path: String,
    show_hidden: bool,
    active_folder_data: State<'_, ActiveFolderItems>,
) -> Result<FolderData, Error> {
    let folders_count = AtomicUsize::new(0);
    let files_count = AtomicUsize::new(0);
    let total_size = AtomicU64::new(0);
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

        if entry.is_dir.unwrap() {
            folders_count.fetch_add(1, Ordering::SeqCst);
        } else {
            files_count.fetch_add(1, Ordering::SeqCst);
        }
        total_size.fetch_add(size, Ordering::SeqCst);
        items.lock().unwrap().push(entry);
    });

    items.lock().unwrap().sort_by(|a, b| {
        let a = a.path.as_ref().unwrap();
        let b = b.path.as_ref().unwrap();
        a.cmp(b)
    });

    // add actual items to app state
    let mut active_folder_data_guard = active_folder_data.0.lock().unwrap();
    active_folder_data_guard.items = items.lock().unwrap().clone();

    let items = active_folder_data_guard.items.clone();
    Ok(FolderData {
        folders_count: folders_count.into_inner(),
        files_count: files_count.into_inner(),
        total_size: total_size.into_inner(),
        items,
    })
}

#[tauri::command]
async fn generate_slides(active_folder_data: State<'_, ActiveFolderItems>) -> Result<Value, Error> {
    let items = active_folder_data.0.lock().unwrap().items.clone();
    let mut slides = vec![];

    items.iter().enumerate().for_each(|(index, item)| {
        match item.extension.as_ref().unwrap().as_str() {
            "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" | "tiff" | "ico" | "avif" => {
                let slide = ImageSlide {
                    index,
                    r#type: "image".to_string(),
                    src: item.request_url.as_ref().unwrap().to_string(),
                };

                slides.push(Slide::Image(slide));
            }
            "mp4" | "ogg" | "ogv" | "webm" => {
                let slide = VideoSlide {
                    index,
                    r#type: "video".to_string(),
                    sources: vec![VideoSource {
                        src: item.request_url.as_ref().unwrap().to_string(),
                    }],
                };

                slides.push(Slide::Video(slide));
            }
            _ => {}
        }
    });

    Ok(serde_json::json!(slides))
}

#[tauri::command]
#[async_recursion]
async fn seach_in_dir(keyword: String) -> Result<(), Error> {
    let root_dir = Path::new("/System/Volumes/Data/");
    let entries = read_dir(root_dir).unwrap();

    for entry in entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if let Some(filename) = path.file_name() {
            if let Some(filename) = filename.to_str() {
                if filename.contains(&keyword) {
                    println!("Found {} in {}", keyword, filename);
                }
            }
        }

        let keyword = keyword.clone();
        if path.is_dir() {
            task::spawn(seach_in_dir(keyword)).await?;
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let menu = Menu::new()
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
                .add_item(
                    CustomMenuItem::new("showHidden", "Show Hidden Files")
                        .accelerator("CmdOrCtrl+Shift+."),
                )
                .add_native_item(MenuItem::Separator),
            // .add_native_item(MenuItem::Cut)
            // .add_native_item(MenuItem::Copy)
            // .add_native_item(MenuItem::Paste)
            // .add_native_item(MenuItem::Separator)
            // .add_native_item(MenuItem::SelectAll),
        ));

    tauri::Builder::default()
        .menu(menu)
        .plugin(tauri_plugin_context_menu::init())
        .on_menu_event(|event| match event.menu_item_id() {
            "showHidden" => {
                event
                    .window()
                    .emit(event.menu_item_id(), Some(true))
                    .unwrap();
            }
            _ => {}
        })
        .manage(AppState {
            db: Default::default(),
        })
        .manage(ActiveFolderItems::default())
        .invoke_handler(tauri::generate_handler![
            get_volumes,
            get_dir_items,
            generate_slides,
            seach_in_dir
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
        .setup(|app| {
            database::initialize();
            let handle = app.handle();

            tokio::spawn(async move {
                let app_state = handle.state::<AppState>();
                let db_path = env::var("DATABASE_URL").unwrap();

                let db = SqlitePool::connect(&db_path).await.unwrap();
                *app_state.db.lock().await = Some(db);

                debug!("Cache database initialized at: {}", db_path);
                debug!("Database connected: {:?}", app_state.db.lock().await);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
