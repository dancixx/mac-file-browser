use indicatif::ProgressBar;
use rayon::prelude::*;
use std::{
    collections::HashSet,
    path::Path,
    sync::{Arc, Mutex},
};
use walkdir::WalkDir;

pub struct SSDIndex {
    pub entries: Vec<String>,
}

impl SSDIndex {
    pub fn new() -> Self {
        SSDIndex {
            entries: Vec::new(),
        }
    }

    pub fn add(&mut self, entry: String) {
        self.entries.push(entry);
    }

    pub fn get(&self, index: usize) -> Option<String> {
        self.entries.get(index).map(|s| s.to_string())
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }
}

#[tauri::command]
pub async fn index_dirs() {
    let index = Arc::new(Mutex::new(SSDIndex::new()));
    let root_dir = Path::new("/System/Volumes/Data/");
    let progress = ProgressBar::new(0);

    WalkDir::new(root_dir)
        .into_iter()
        // .par_bridge()
        .filter_map(Result::ok)
        .for_each(|e| {
            index
                .lock()
                .unwrap()
                .add(e.path().to_str().unwrap().to_string());

            progress.inc(1);
        });
}
