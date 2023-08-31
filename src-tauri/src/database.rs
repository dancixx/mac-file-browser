use std::{fs::File, path::Path};
use tracing::debug;

pub fn initialize() {
    let db_path = Path::new("./cache.sqlite");

    if db_path.exists() {
        return debug!("Database already exists");
    }

    File::create(db_path).unwrap();
    debug!("Database created");
}
