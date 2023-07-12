use serde::{Deserialize, Serialize};
use sysinfo::DiskKind;

pub struct DiskKindWrapper(pub DiskKind);

impl Into<String> for DiskKindWrapper {
    fn into(self) -> String {
        match self.0 {
            DiskKind::HDD => String::from("HDD"),
            DiskKind::SSD => String::from("SSD"),
            _ => String::from("Unknown"),
        }
    }
}
#[derive(Serialize, Deserialize)]
pub struct Disk {
    pub name: Option<String>,
    pub mount_point: Option<String>,
    pub kind: Option<String>,
    pub file_system: Option<String>,
    pub total_space: Option<u64>,
    pub available_space: Option<u64>,
}

impl Disk {
    pub fn new() -> Self {
        Self {
            name: None,
            mount_point: None,
            kind: None,
            file_system: None,
            total_space: None,
            available_space: None,
        }
    }
}
