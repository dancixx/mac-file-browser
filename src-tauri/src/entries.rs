use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FolderData {
    pub folders_count: usize,
    pub files_count: usize,
    pub total_size: u64,
    pub items: Vec<Entry>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Entry {
    pub extension: Option<String>,
    pub is_dir: Option<bool>,
    pub is_hidden: Option<bool>,
    pub modified: Option<String>,
    pub name: Option<String>,
    pub path: Option<String>,
    pub request_url: Option<String>,
    pub size: Option<u64>,
}

impl Entry {
    pub fn new() -> Self {
        Self {
            extension: None,
            is_dir: None,
            is_hidden: None,
            modified: None,
            name: None,
            path: None,
            request_url: None,
            size: None,
        }
    }
}
