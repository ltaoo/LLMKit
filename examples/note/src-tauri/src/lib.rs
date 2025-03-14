use std::borrow::Cow;
use std::env;
use std::io::Seek;
use std::io::{self, BufReader, Cursor, Read};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::string::FromUtf8Error;
use std::sync::mpsc::{self, Receiver};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::{fs, fs::File, thread};

use dirs;
use dotenv::dotenv;
use futures::TryStreamExt;
// use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Deserializer, Serializer, Value};
use sqlx::migrate::{MigrateDatabase, Migration, MigrationType, Migrator};
use sqlx::prelude::FromRow;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::Row;
use sqlx::{Pool, Sqlite, SqlitePool};
use tauri::async_runtime::Mutex as AsyncMutex;
use tauri::path::BaseDirectory;
#[allow(unused)]
use tauri::{
    App, AppHandle, Context, Emitter, Listener, Manager, RunEvent, Runtime, State, WebviewUrl,
};

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    // #[error("there is something wrong in io")]
    // IOError(std::io::Error),
    #[error("there is something wrong in reqwest")]
    // ReqwestError(reqwest::Error),
    // #[error("there is something wrong in serde_json")]
    SerdeJSONError(serde_json::Error),
    #[error("there is something wrong when encode utf8")]
    FromUtf8Error(std::string::FromUtf8Error),
    #[error("database error: {0}")]
    SqlxError(#[from] sqlx::Error),
    #[error("unknown error")]
    OtherError(String),
}
impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::SerdeJSONError(err)
    }
}
impl From<std::string::FromUtf8Error> for Error {
    fn from(err: std::string::FromUtf8Error) -> Self {
        Error::FromUtf8Error(err)
    }
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct BizResponse {
    code: i32,
    msg: String,
    data: String,
}
impl BizResponse {
    fn new(code: i32, msg: &str, data: &str) -> Self {
        Self {
            code,
            msg: String::from(msg),
            data: String::from(data),
        }
    }
    fn to_str(&self) -> String {
        let r = serde_json::to_string(self);
        if r.is_err() {
            let code = 1;
            let msg = "serde failed";
            return format!(r#"{{"code":{},"msg":"{}","data":{}}}"#, code, msg, "");
        }
        return r.unwrap();
    }
}

struct AppState {
    // pub rx: AsyncMutex<Receiver<notify::Result<notify::Event>>>,
    // pub watcher: AsyncMutex<ReadDirectoryChangesWatcher>,
    // db: Arc<Mutex<SqlitePool>>,
    db: Pool<Sqlite>,
}

fn app_local_data_dir() -> Result<PathBuf, Error> {
    let mut path = dirs::document_dir()
        .ok_or_else(|| Error::OtherError("Could not find local data directory".to_string()))?;
    path.push("readapp");
    path.push("dicts");
    fs::create_dir_all(&path)?;
    Ok(path)
}
async fn setup_db(app: &App) -> Pool<Sqlite> {
    let mut path = app.path().data_dir().expect("failed to get data_dir");
    path.push("com.funzm.note");
    match std::fs::create_dir_all(path.clone()) {
        Ok(_) => {}
        Err(err) => {
            panic!("error creating directory {}", err);
        }
    };
    path.push("db.sqlite");
    println!("the database path is {}", path.to_str().unwrap());

    let r = Sqlite::create_database(
        format!(
            "sqlite:{}",
            path.to_str().expect("path should be something")
        )
        .as_str(),
    )
    .await;
    if r.is_err() {
        println!("create_database failed, because {}", r.err().unwrap());
    }

    let db = SqlitePoolOptions::new()
        .connect(path.to_str().unwrap())
        .await
        .unwrap();

    let r2 = sqlx::migrate!("./migrations").run(&db).await;
    if r2.is_err() {
        println!("migrate failed, because {}", r2.err().unwrap());
    }
    println!("migrate success？");
    // 创建迁移
    // let migrations = vec![sqlx::migrate::Migration::new(
    //     1,                      // 版本号
    //     "create_tables".into(), // 名称
    //     MigrationType::Simple,
    //     r#"CREATE TABLE IF NOT EXISTS articles (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             title TEXT NOT NULL,
    //             content TEXT NOT NULL,
    //             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    //         );

    //         CREATE TABLE IF NOT EXISTS paragraphs (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             article_id INTEGER NOT NULL,
    //             content TEXT NOT NULL,
    //             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (article_id) REFERENCES articles(id)
    //         );
    //         "#
    //     .into(),
    //     false,
    // )];
    // 创建迁移器
    // let r3 = Migrator::new(migrations).await;
    // if r3.is_err() {
    //     println!("migrate failed, because {}", r3.err().unwrap());
    //     return db;
    // }
    // 执行迁移
    // println!("Running migrations...");
    // let migrator = r3.unwrap();
    // match migrator.run(&db).await {
    //     Ok(_) => println!("Migrations completed successfully"),
    //     Err(e) => println!("Migration error: {}", e),
    // }

    db
}

#[derive(Debug, Serialize, Deserialize)]
struct DeepseekRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
    stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct LanguageModelRequestPayload {
    model: String,
    messages: Vec<Message>,
    format: String,
    stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct DeepseekResponse {
    id: String,
    model: String,
    object: String,
    created: i64,
    choices: Vec<Choice>,
    usage: Usage,
}

#[derive(Debug, Serialize, Deserialize)]
struct Choice {
    index: i32,
    message: Message,
    finish_reason: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct LanguageModelResponse {
    model: String,
    message: Message,
}

#[derive(Debug, Serialize, Deserialize)]
struct Usage {
    prompt_tokens: i32,
    completion_tokens: i32,
    total_tokens: i32,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();


    let app = tauri::Builder::default()
        // .manage(state)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            fetch_articles,
        ])
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap().clone();
            // let mut path = dirs::document_dir().unwrap();
            // println!("setup document_dir1 {}", path.to_str().unwrap());
            // let path2 = app.path().document_dir().unwrap();
            // println!("setup document_dir2 {}", path2.to_str().unwrap());
            // let mut path3 = dirs::data_dir().unwrap();
            // println!("setup data_dir {}", path3.to_str().unwrap());
            // let path4 = app.path().data_dir().unwrap();
            // println!("setup data_dir2 {}", path4.to_str().unwrap());
            // window.open_devtools();
            tauri::async_runtime::block_on(async move {
                let db = setup_db(&app).await;
                app.manage(AppState { db });
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_app_handle, _event| match &_event {
        tauri::RunEvent::WindowEvent {
            event: tauri::WindowEvent::CloseRequested { api, .. },
            label,
            ..
        } => {}
        _ => (),
    });
}

#[tauri::command]
async fn create_article(
    title: String,
    paragraphs: Vec<String>,
    state: tauri::State<'_, AppState>,
) -> Result<Value, Error> {
    println!("[COMMAND]create_article");
    let content = paragraphs.join("\n\n");
    let db = &state.db;
    let r = sqlx::query("INSERT INTO `articles` (title, content) VALUES (?1, ?2)")
        .bind(title)
        .bind(content)
        .execute(db)
        .await;
    if r.is_err() {
        println!("[]create article failed, because {}", r.err().unwrap());
        return Ok(json!({
            "code": 302,
            "msg": "",
            "data": Value::Null,
        }));
    }

    let article = r.unwrap();
    let article_id = article.last_insert_rowid();

    println!("[]create_article - after create {}", article_id);

    // Insert paragraphs
    for (index, paragraph) in paragraphs.iter().enumerate() {
        sqlx::query("INSERT INTO `paragraphs` (article_id, idx, text) VALUES (?1, ?2, ?3)")
            .bind(article_id)
            .bind(index as i32)
            .bind(paragraph)
            .execute(db)
            .await
            .map_err(|e| Error::OtherError(format!("Failed to create paragraph: {}", e)))?;
    }
    Ok(json!({
        "code": 0,
        "data": {
            "id": article_id
        }
    }))
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct ArticleRecord {
    id: i32,
    title: String,
    content: String,
    created_at: String,
}

#[tauri::command]
async fn fetch_articles(state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    // let mut stmt = sqlx::query("SELECT * FROM subscriptions")?;
    let r = sqlx::query_as::<_, ArticleRecord>("SELECT * FROM articles")
        .fetch(db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get todos {}", e));

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "data": Value::Null
        }));
    }
    let articles: Vec<ArticleRecord> = r.unwrap();
    Ok(json!({
        "code": 0,
        "data": {
            "list": articles.iter().map(|f| {
            json!({
                "id": f.id,
                "title": f.title,
                "created_at": f.created_at
            })
        }).collect::<Vec<Value>>()
        }
    }))
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct ParagraphRecord {
    id: i32,
    article_id: i32,
    idx: i32,
    text: String,
    language: Option<String>,
    translation1: Option<String>,
}

#[tauri::command]
async fn fetch_article_profile(id: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let r = sqlx::query_as::<_, ArticleRecord>("SELECT * FROM `articles` WHERE `id` = ?1")
        .bind(id)
        .fetch_one(db)
        .await;

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": "获取失败1",
            "data": Value::Null
        }));
    }

    let article = r.unwrap();

    let r2 =
        sqlx::query_as::<_, ParagraphRecord>("SELECT * FROM `paragraphs` WHERE `article_id` = ?1")
            .bind(id)
            .fetch(db)
            .try_collect()
            .await;

    if r2.is_err() {
        println!(
            "[]fetch_article_profile - fetch paragraphs failed, because {}",
            r2.err().unwrap()
        );
        return Ok(json!({
            "code": 301,
            "msg": "获取失败2",
            "data": Value::Null
        }));
    }

    let paragraphs: Vec<ParagraphRecord> = r2.unwrap();

    Ok(json!({
        "code": 0,
        "data": {
            "id": article.id,
            "title": article.title,
            "paragraphs": paragraphs.iter().map(|f| {
                json!({
                    "id": f.id,
                    "text": f.text,
                    "translation1": f.translation1,
                })
            }).collect::<Vec<Value>>()
        }
    }))
}
