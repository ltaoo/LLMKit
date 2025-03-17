use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Deserializer, Serializer, Value};

use futures::TryStreamExt;
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

use crate::internals::error::Error;
use crate::internals::state::AppState;

#[tauri::command]
pub async fn create_note(
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
pub struct NoteRecord {
    id: i32,
    name: String,
    content: String,
    created_at: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn fetch_notes(page: i32, page_size: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
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
pub async fn fetch_note_profile(id: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
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
pub async fn update_note(id: i32, title: Option<String>, content: Option<String>, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
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
