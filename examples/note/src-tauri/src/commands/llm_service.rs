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

#[derive(Debug, Serialize, Deserialize)]
pub struct LanguageModelRequestPayload {
    model: String,
    messages: Vec<Message>,
    #[serde(rename = "apiProxyAddress")]
    api_proxy_address: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    role: String,
    content: String,
}


#[tauri::command]
pub async fn api_v1_chat(
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

