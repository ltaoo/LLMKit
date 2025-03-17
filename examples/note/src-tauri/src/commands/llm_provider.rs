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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LLMProviderRecord {
    id: String,
    name: String,
    logo_uri: String,
    api_address: String,
    configure: String,
    api_proxy_address: Option<String>,
    api_key: Option<String>,
    enabled: i32,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LLMProviderModelRecord {
    id: String,
    name: String,
    llm_provider_id: String,
    enabled: i32,
    builtin: i32,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn fetch_llm_providers(state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let count = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM `LLM_PROVIDER`")
        .fetch_one(db)
        .await?;
    let r = sqlx::query_as::<_, LLMProviderRecord>("SELECT * FROM `LLM_PROVIDER`")
        .fetch(db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get providers {}", e));
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }
    let providers: Vec<LLMProviderRecord> = r.unwrap();
    
    let provider_ids = providers
        .iter()
        .map(|p| format!("'{}'", p.id))
        .collect::<Vec<String>>()
        .join(",");
    
    let query = format!("SELECT * FROM `LLM_PROVIDER_MODEL` WHERE `llm_provider_id` IN ({}) ORDER BY llm_provider_id", provider_ids);
    let r2 = sqlx::query_as::<_, LLMProviderModelRecord>(&query)
        .fetch(db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get models {}", e));

    if r2.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r2.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }

    let models: Vec<LLMProviderModelRecord> = r2.unwrap();

    Ok(json!({
        "code": 0,
        "data": {
            "list": providers.iter().map(|provider| {
                json!({
                    "id": provider.id,
                    "name": provider.name,
                    "logo_uri": provider.logo_uri,
                    "api_address": provider.api_address,
                    "configure": provider.configure,
                    "api_proxy_address": provider.api_proxy_address,
                    "api_key": provider.api_key,
                    "enabled": provider.enabled,
                    "models": models.iter()
                        .filter(|model| model.llm_provider_id == provider.id)
                        .collect::<Vec<&LLMProviderModelRecord>>()
                })
            }).collect::<Vec<Value>>(),
        }
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_llm_provider(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let provider = payload;
    let id = provider.get("id").unwrap().as_str().unwrap();

    println!("update_llm_provider: {:?}, {}", provider, id);
    
    // 构建动态 SQL 更新语句
    let mut update_fields = Vec::new();
    let mut params: Vec<Value> = Vec::new();
    
    if let Some(api_proxy_address) = provider.get("api_proxy_address") {
        update_fields.push("`api_proxy_address` = ?");
        params.push(api_proxy_address.clone());
    }
    if let Some(api_key) = provider.get("api_key") {
        update_fields.push("`api_key` = ?");
        params.push(api_key.clone());
    }
    if let Some(enabled) = provider.get("enabled") {
        update_fields.push("`enabled` = ?");
        params.push(json!(if enabled.as_bool().unwrap_or(false) { 1 } else { 0 }));
    }

    if update_fields.is_empty() {
        return Ok(json!({
            "code": 301,
            "msg": "No update fields",
            "data": Value::Null
        }));
    }

    let sql = format!(
        "UPDATE `LLM_PROVIDER` SET {} WHERE `id` = ?",
        update_fields.join(", ")
    );

    // 构建查询
    let mut query = sqlx::query(&sql);
    
    // 绑定所有参数
    for param in params {
        query = match param {
            Value::String(s) => query.bind(s),
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    query.bind(i)
                } else {
                    query.bind(n.as_f64().unwrap())
                }
            },
            _ => query,
        };
    }
    
    // 绑定 id 参数
    query = query.bind(id);

    // 执行更新
    let r = query.execute(db).await
        .map_err(|e| format!("Failed to update provider {}", e));

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }

    Ok(json!({
        "code": 0,
        "data": Value::Null
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_provider_model(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let model_id = payload.get("model_id").unwrap().as_str().unwrap();
    let provider_id = payload.get("provider_id").unwrap().as_str().unwrap();

    let r = sqlx::query("INSERT INTO `LLM_PROVIDER_MODEL` (`id`, `name`, `llm_provider_id`, `enabled`, `builtin`) VALUES (?, ?, ?, ?, ?)")
        .bind(model_id)
        .bind(model_id)
        .bind(provider_id)
        .bind(1)
        .bind(0)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to create provider model {}", e));
    
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }

    Ok(json!({
        "code": 0,
        "data": Value::Null
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_provider_model(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let model_id = payload.get("model_id").unwrap().as_str().unwrap();
    let provider_id = payload.get("provider_id").unwrap().as_str().unwrap();

    let r = sqlx::query("DELETE FROM `LLM_PROVIDER_MODEL` WHERE `id` = ? AND `llm_provider_id` = ?")
        .bind(model_id)
        .bind(provider_id)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to delete provider model {}", e));

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }

    Ok(json!({
        "code": 0,
        "data": Value::Null
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_provider_model(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let model_id = payload.get("model_id").unwrap().as_str().unwrap();
    let provider_id = payload.get("provider_id").unwrap().as_str().unwrap();
    let enabled = payload.get("enabled").unwrap().as_bool().unwrap();

    let r = sqlx::query("UPDATE `LLM_PROVIDER_MODEL` SET `enabled` = ? WHERE `id` = ? AND `llm_provider_id` = ?")
        .bind(enabled)
        .bind(model_id)
        .bind(provider_id)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to update provider model {}", e));

    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }

    Ok(json!({
        "code": 0,
        "data": Value::Null
    }))
}