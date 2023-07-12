use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Entry {
    pub path: Option<String>,
    pub is_dir: Option<bool>,
    pub is_hidden: Option<bool>,
    pub extension: Option<String>,
    pub size: Option<u64>,
    pub modified: Option<String>,
    pub name: Option<String>,
}

impl Entry {
    pub fn new() -> Self {
        Self {
            path: None,
            is_dir: None,
            is_hidden: None,
            extension: None,
            size: None,
            modified: None,
            name: None,
        }
    }
}
