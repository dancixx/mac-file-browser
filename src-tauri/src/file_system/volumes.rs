use crate::state::AppState;
use serde::Serialize;
use sqlx::{Pool, Sqlite};
use std::path::Path;
use sysinfo::{Disk, DiskExt, System, SystemExt};
use tauri::{Result as TauriResult, State};
use tracing::debug;
use walkdir::WalkDir;

#[derive(Serialize, Debug, Clone)]
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

impl Volume {
    #[allow(dead_code)]
    pub async fn create_cache(&self, db: &Pool<Sqlite>) {
        let mut connection = db.acquire().await.unwrap();
        let name = self.name.as_ref().unwrap().to_string();
        let mount_point = self.mount_point.as_ref().unwrap().to_string();
        let table_name = name.replace(" ", "_").to_lowercase();

        // Check if table for this volume exists
        let table_exists =
            sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='{?}';")
                .bind(&table_name)
                .fetch_optional(&mut *connection)
                .await
                .unwrap();

        if table_exists.is_none() {
            debug!(
                "Creating table for {}:{}",
                self.name.as_ref().unwrap(),
                table_name
            );

            sqlx::query(
                "CREATE TABLE '{?}' (
                    id INTEGER PRIMARY KEY,
                    path TEXT NOT NULL
                );",
            )
            .bind(&table_name)
            .execute(&mut *connection)
            .await
            .unwrap();

            // Insert all files in this volume into the database
            let path = Path::new(&mount_point);
            //let entries = Arc::new(Mutex::new(Vec::new()));
            let walk_dir = WalkDir::new(path)
                .into_iter()
                // TODO: Figure out how to use rayon with async
                //.par_bridge()
                .filter_map(Result::ok);

            for entry in walk_dir {
                let path_entry = entry.path().to_string_lossy().to_string();
                sqlx::query("INSERT INTO '{?}' (path) VALUES (?);")
                    .bind(&table_name)
                    .bind(&path_entry)
                    .execute(&mut *connection)
                    .await
                    .unwrap();

                debug!("Inserted {} into {}", path_entry, table_name);
            }

            debug!("Finished indexing {}", table_name);
        } else {
            debug!("Table for {} exists", table_name);
        }
    }
}

#[tauri::command]
pub async fn get_volumes(app_state: State<'_, AppState>) -> TauriResult<Vec<Volume>> {
    let mut volumes = Vec::new();
    let mut system = System::new_all();
    system.refresh_disks_list();
    let db = app_state.db.lock().await;

    for disk in system.disks() {
        let disk = Volume::from(disk);
        let db = db.as_ref().unwrap();
        disk.create_cache(db).await;
        volumes.push(disk);
    }

    Ok(volumes)
}
