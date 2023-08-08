use indicatif::ProgressBar;
use std::{
    path::Path,
    sync::{Arc, Mutex},
};

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

    visit_dirs(root_dir, index.clone(), progress);
}

pub fn visit_dirs(dir: &Path, index: Arc<Mutex<SSDIndex>>, progress: ProgressBar) {
    if dir.is_dir() {
        for entry in dir.read_dir().unwrap() {
            if entry.is_err() {
                continue;
            }
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                visit_dirs(&path, index.clone(), progress.clone());
            } else {
                index
                    .lock()
                    .unwrap()
                    .add(path.to_str().unwrap().to_string());
            }
        }
        progress.inc(1);
    }
}
