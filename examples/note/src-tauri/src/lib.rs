use std::borrow::Cow;
use std::{env, fs, fs::File, thread};
use std::io::{self, Seek, BufReader, Cursor, Read};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::mpsc::{self, Receiver};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use dirs;
use dotenv::dotenv;
use futures::TryStreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Deserializer, Serializer, Value};
use sqlx::migrate::{MigrateDatabase, Migration, MigrationType, Migrator};
use sqlx::prelude::FromRow;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::Row;
use sqlx::{Pool, Sqlite, SqlitePool};
use tauri::async_runtime::Mutex as AsyncMutex;
use tauri::path::BaseDirectory;
use tauri::PhysicalSize;
use tauri::WebviewWindow;
#[allow(unused)]
use tauri::{
    App, AppHandle, Context, Emitter, Listener, Manager, RunEvent, Runtime, State, WebviewUrl,
};
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
    db
}

#[derive(Debug, Serialize, Deserialize)]
struct LanguageModelRequestPayload {
    model: String,
    messages: Vec<Message>,
    #[serde(rename = "apiProxyAddress")]
    api_proxy_address: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    let app = tauri::Builder::default()
        // .manage(state)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            api_v1_chat,
            show_chat_window,
            create_note,
            fetch_notes,
            fetch_note_profile,
            update_note,
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
async fn api_v1_chat(
    payload: LanguageModelRequestPayload,
    state: tauri::State<'_, AppState>,
) -> Result<Value, Error> {
    println!("[COMMAND]api_v1_chat");
    
    let client = Client::new();

    let stream = payload.extra.get("stream")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let temperature = payload.extra.get("temperature")
        .and_then(|v| v.as_f64())
        .map(|v| v as f32)
        .unwrap_or(0.7);

    let request_body = json!({
        "messages": payload.messages,
        "model": payload.model,
        "stream": stream,
        "temperature": temperature
    });

    let response = client
        .post(payload.api_proxy_address)
        .header("Authorization", format!("Bearer {}", payload.api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| Error::OtherError(format!("Failed to send request: {}", e)))?;

    let response_text = response
        .text()
        .await
        .map_err(|e| Error::OtherError(format!("Failed to read response: {}", e)))?;

    let response_json: Value = serde_json::from_str(&response_text)
        .map_err(|e| Error::OtherError(format!("Failed to parse response JSON: {}", e)))?;

    Ok(response_json)
}

#[tauri::command]
async fn create_note(
    state: tauri::State<'_, AppState>,
) -> Result<Value, Error> {
    println!("[COMMAND]create_note");
    let db = &state.db;

    // Find the next available unnamed number
    let r = sqlx::query_scalar::<_, Option<String>>(
        "SELECT name FROM `NOTE` WHERE name LIKE '未命名%' ORDER BY name DESC LIMIT 1"
    )
    .fetch_optional(db)
    .await?;

    let new_name = match r {
        None => "未命名".to_string(),
        Some(last_name) => {
            let name = last_name.unwrap();
            if name == "未命名" {
                "未命名1".to_string()
            } else {
                // Extract number from last name and increment
                let num: i32 = name.trim_start_matches("未命名")
                    .parse()
                    .unwrap_or(0);
                format!("未命名{}", num + 1)
            }
        }
    };
    println!("[]create_note - new_name: {}", new_name);
    let r = sqlx::query("INSERT INTO `NOTE` (name, content, filepath, parent_filepath) VALUES (?1, ?2, ?3, ?4)")
        .bind(&new_name)
        .bind("")
        .bind(format!("{}.md", new_name))
        .bind("/")
        .execute(db)
        .await;

    if let Err(err) = r {
        println!("[]create note failed, because {}", err);
        return Ok(json!({
            "code": 302,
            "msg": "Failed to create note",
            "data": Value::Null,
        }));
    }

    let note = r.unwrap();
    let note_id = note.last_insert_rowid();

    println!("[]create_note - after create {} with name {}", note_id, new_name);
    Ok(json!({
        "code": 0,
        "data": {
            "id": note_id,
            "title": new_name,
        }
    }))
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct NoteRecord {
    id: i32,
    name: String,
    content: String,
    created_at: String,
}

#[tauri::command(rename_all = "snake_case")]
async fn fetch_notes(page: i32, page_size: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let offset = (page - 1) * page_size;
    let count = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM `NOTE`")
        .fetch_one(db)
        .await?;
    let r = sqlx::query_as::<_, NoteRecord>("SELECT * FROM `NOTE` ORDER BY `created_at` DESC LIMIT ?1 OFFSET ?2")
        .bind(page_size)
        .bind(offset)
        .fetch(db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get notes {}", e));
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }
    let notes: Vec<NoteRecord> = r.unwrap();
    Ok(json!({
        "code": 0,
        "data": {
            "list": notes.iter().map(|f| {
                json!({
                    "id": f.id,
                    "title": f.name,
                    "created_at": f.created_at
                })
            }).collect::<Vec<Value>>(),
            "page": page,
            "page_size": page_size,
            "total": count
        }
    }))
}

#[tauri::command]
async fn fetch_note_profile(id: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let r = sqlx::query_as::<_, NoteRecord>("SELECT * FROM `NOTE` WHERE `id` = ?1")
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
    Ok(json!({
        "code": 0,
        "data": {
            "id": article.id,
            "title": article.name,
            "content": article.content,
            "created_at": article.created_at,
        }
    }))
}

#[tauri::command]
async fn update_note(id: i32, title: Option<String>, content: Option<String>, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    // Return error if both title and content are None
    if title.is_none() && content.is_none() {
        return Ok(json!({
            "code": 400,
            "msg": "At least one of title or content must be provided",
            "data": Value::Null
        }));
    }

    let db = &state.db;
    
    // Build the SQL query dynamically based on which fields are present
    let (query, params) = if title.is_some() && content.is_some() {
        ("UPDATE `NOTE` SET `name` = ?1, `content` = ?2 WHERE `id` = ?3", vec![title, content, Some(id.to_string())])
    } else if title.is_some() {
        ("UPDATE `NOTE` SET `name` = ?1 WHERE `id` = ?2", vec![title, Some(id.to_string())])
    } else {
        ("UPDATE `NOTE` SET `content` = ?1 WHERE `id` = ?2", vec![content, Some(id.to_string())])
    };

    let mut query_builder = sqlx::query(query);
    for param in params {
        if let Some(value) = param {
            query_builder = query_builder.bind(value);
        }
    }

    let r = query_builder.execute(db).await;

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": "Update failed",
            "data": Value::Null
        }));
    }

    Ok(json!({
        "code": 0,
        "msg": "Update successful",
        "data": Value::Null
    }))
}

#[tauri::command]
fn show_chat_window(url: String, app: tauri::AppHandle) -> Result<serde_json::Value, ()> {
    let chat_window = WebviewWindow::builder(&app, "chat", tauri::WebviewUrl::App(url.into()))
        .build()
        .unwrap();
    chat_window.set_size(PhysicalSize::new(360, 800));
    chat_window.set_title("Chat");
    chat_window.show();
    return Ok(json!({
        "code": 0,
        "msg": "",
        "data": serde_json::Value::Null,
    }));
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



