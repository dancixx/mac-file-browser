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
        let pathname = pathname.to_str().unwrap().to_string();
        let name = pathname.split("/").last().unwrap().to_string();

        entry.is_dir = Some(metadata.is_dir());
        entry.is_hidden = Some(name.starts_with("."));
        entry.path = Some(pathname);
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
