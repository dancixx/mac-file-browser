use chrono::{Local, TimeZone};
use disks::{Disk, DiskKindWrapper};
use entries::Entry;
use sysinfo::{DiskExt, System, SystemExt};

mod disks;
mod entries;

#[tauri::command]
async fn disks() -> Vec<Disk> {
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

    disks
}

#[tauri::command]
async fn get_folder_items(path: String) -> Vec<Entry> {
    let mut items = Vec::new();
    let paths = std::fs::read_dir(path).unwrap();

    for path in paths {
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
        let name = pathname.split("/").last().unwrap().to_string();

        entry.is_dir = Some(metadata.is_dir());
        entry.is_hidden = Some(name.starts_with("."));
        entry.name = Some(name);
        entry.path = Some(pathname);
        entry.extension = Some(extension);
        entry.size = Some(size);
        entry.modified = Some(formatted_time);
        items.push(entry);
    }

    items.sort_by(|a, b| {
        let a = a.path.as_ref().unwrap();
        let b = b.path.as_ref().unwrap();
        a.cmp(b)
    });
    items
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![disks, get_folder_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
