use std::sync::Arc;

use sqlx::{Pool, Sqlite};
use tokio::sync::Mutex;

pub struct AppState {
    pub db: Arc<Mutex<Option<Pool<Sqlite>>>>,
}

// pub trait ServiceAccess {
//     fn db(&self) -> &Mutex<Option<Pool<Sqlite>>>;
//     fn db_mut(&mut self) -> &mut Mutex<Option<Pool<Sqlite>>>;
// }

// impl ServiceAccess for AppState {
//     fn db(&self) -> &Mutex<Option<Pool<Sqlite>>> {
//         &self.db
//     }

//     fn db_mut(&mut self) -> &mut Mutex<Option<Pool<Sqlite>>> {
//         &mut self.db
//     }
// }
