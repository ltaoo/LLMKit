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

pub mod commands;
pub mod internals;

use crate::internals::error::Error;
use crate::internals::state::AppState;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    let app = tauri::Builder::default()
        // .manage(state)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::llm_service::api_v1_chat,
            commands::note::create_note,
            commands::note::fetch_notes,
            commands::note::fetch_note_profile,
            commands::note::update_note,
            commands::llm_agent::fetch_llm_agents,
            commands::llm_agent::update_llm_agent,
            commands::llm_agent::find_llm_agent_by_id,
            commands::llm_provider::fetch_llm_providers,
            commands::llm_provider::update_llm_provider,
            commands::llm_provider::create_provider_model,
            commands::llm_provider::delete_provider_model,
            commands::llm_provider::update_provider_model,
            show_chat_window,
        ])
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap().clone();
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


fn app_local_data_dir() -> Result<PathBuf, Error> {
    let mut path = dirs::document_dir()
        .ok_or_else(|| Error::OtherError("Could not find local data directory".to_string()))?;
    path.push("readapp");
    path.push("dicts");
    fs::create_dir_all(&path)?;
    Ok(path)
}


