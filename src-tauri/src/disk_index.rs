use indicatif::ProgressBar;
use rayon::prelude::*;
use std::{
    collections::HashSet,
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
    // let visited = Arc::new(Mutex::new(HashSet::new()));
    let root_dir = Path::new("/System/Volumes/Data/");
    let progress = ProgressBar::new(0);

    //    visit_dirs(root_dir, index.clone(), progress, visited.clone());
    walk_dirs(root_dir, index.clone(), progress);
}

pub fn visit_dirs(
    dir: &Path,
    index: Arc<Mutex<SSDIndex>>,
    progress: ProgressBar,
    visited: Arc<Mutex<HashSet<String>>>,
) {
    if dir.is_dir() {
        let dir_str = dir.to_str().unwrap().to_string();

        {
            let mut visited_dirs = visited.lock().unwrap();
            if visited_dirs.contains(&dir_str) {
                println!("Already visited {}", dir_str);
                return;
            }
            visited_dirs.insert(dir_str);
        }

        if let Ok(entries) = dir.read_dir() {
            entries.for_each(|entry| {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        if path.is_dir() {
                            visit_dirs(&path, index.clone(), progress.clone(), visited.clone());
                        } else {
                            index
                                .lock()
                                .unwrap()
                                .add(path.to_str().unwrap().to_string());
                        }
                    }
                    Err(_) => {}
                }
                progress.inc(1);
            });
        }
    }
}

pub fn walk_dirs(dir: &Path, index: Arc<Mutex<SSDIndex>>, progress: ProgressBar) {
    let walker = walkdir::WalkDir::new(dir).into_iter();

    walker
        .into_iter()
        .par_bridge()
        .filter_map(Result::ok)
        .for_each(|e| {
            index
                .lock()
                .unwrap()
                .add(e.path().to_str().unwrap().to_string());
        });
}
