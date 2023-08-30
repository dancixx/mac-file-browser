use serde::Serialize;
use sysinfo::{Disk, DiskExt, System, SystemExt};
use tauri::Error;

#[derive(Serialize, Debug)]
pub struct Volume {
    pub name: Option<String>,
    pub mount_point: Option<String>,
    pub kind: Option<String>,
    pub file_system: Option<String>,
    pub total_space: Option<u64>,
    pub available_space: Option<u64>,
}

impl From<&Disk> for Volume {
    fn from(disk: &Disk) -> Self {
        let total_space = disk.total_space() / 1024_u64.pow(3);
        let available_space = disk.available_space() / 1024_u64.pow(3);
        let kind = match disk.kind() {
            sysinfo::DiskKind::HDD => String::from("HDD"),
            sysinfo::DiskKind::SSD => String::from("SSD"),
            _ => String::from("Unknown"),
        };
        let file_system = disk.file_system();
        let mount_point = disk
            .mount_point()
            .to_path_buf()
            .to_string_lossy()
            .to_string();
        let name = disk.name().to_os_string().to_string_lossy().to_string();

        Self {
            name: Some(name),
            mount_point: Some(mount_point),
            kind: Some(kind),
            file_system: Some(
                file_system
                    .to_vec()
                    .iter()
                    .map(|&c| c as char)
                    .collect::<String>(),
            ),
            total_space: Some(total_space),
            available_space: Some(available_space),
        }
    }
}

#[tauri::command]
pub async fn get_volumes() -> Result<Vec<Volume>, Error> {
    let mut disks = Vec::new();
    let mut system = System::new_all();
    system.refresh_disks_list();

    for disk in system.disks() {
        let disk = Volume::from(disk);
        disks.push(disk);
    }

    Ok(disks)
}
