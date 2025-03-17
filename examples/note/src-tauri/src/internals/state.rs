use sqlx::{Pool, Sqlite, SqlitePool};

pub struct AppState {
    pub db: Pool<Sqlite>,
}
