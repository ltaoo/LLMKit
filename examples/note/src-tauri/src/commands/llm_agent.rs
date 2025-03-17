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
pub struct LLMAgentRecord {
    id: i32,
    name: String,
    desc: String,
    avatar_uri: String,
    prompt: String,
    tags: String,
    agent_type: i32,
    llm_config: String,
    llm_provider_id: String,
    llm_model_id: String,
    builtin: i32,
    config: String,
    created_at: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn fetch_llm_agents(page: i32, page_size: i32, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let offset = (page - 1) * page_size;
    let count = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM `LLM_AGENT`")
        .fetch_one(db)
        .await?;
    let r = sqlx::query_as::<_, LLMAgentRecord>("SELECT * FROM `LLM_AGENT` ORDER BY `created_at` DESC LIMIT ?1 OFFSET ?2")
        .bind(page_size)
        .bind(offset)
        .fetch(db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get agents {}", e));
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }
    let notes: Vec<LLMAgentRecord> = r.unwrap();
    Ok(json!({
        "code": 0,
        "data": {
            "list": notes.iter().map(|f| {
                json!({
                    "id": f.id,
                    "name": f.name,
                    "desc": f.desc,
		    "avatar_uri": f.avatar_uri,
		    "prompt": f.prompt,
		    "tags": f.tags,
		    "agent_type": f.agent_type,
		    "llm_config": f.llm_config,
		    "llm_provider_id": f.llm_provider_id,
		    "llm_model_id": f.llm_model_id,
		    "builtin": f.builtin,
                    "config": f.config,
		    "created_at": f.created_at
                })
            }).collect::<Vec<Value>>(),
            "page": page,
            "page_size": page_size,
            "total": count
        }
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_llm_agent(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let id = payload.get("id").unwrap().as_i64().unwrap();

    // 构建动态 SQL 更新语句
    let mut update_fields = Vec::new();
    let mut params: Vec<Value> = Vec::new();
    
    if let Some(name) = payload.get("name") {
        update_fields.push("`name` = ?");
        params.push(name.clone());
    }
    if let Some(desc) = payload.get("desc") {
        update_fields.push("`desc` = ?");
        params.push(desc.clone());
    }
    if let Some(prompt) = payload.get("prompt") {
        update_fields.push("`prompt` = ?");
        params.push(prompt.clone());
    }
    if let Some(tags) = payload.get("tags") {
        update_fields.push("`tags` = ?");
        params.push(tags.clone());
    }
    if let Some(agent_type) = payload.get("agent_type") {
        update_fields.push("`agent_type` = ?");
        params.push(agent_type.clone());
    }
    if let Some(llm) = payload.get("llm") {
        println!("llm: {:?}", llm);
        if let Some(provider_id) = llm.get("provider_id") {
            update_fields.push("`llm_provider_id` = ?");
            params.push(provider_id.clone());
        }
        if let Some(model_id) = llm.get("model_id") {
            update_fields.push("`llm_model_id` = ?");
            params.push(model_id.clone());
        }
        if let Some(extra) = llm.get("extra") {
            update_fields.push("`llm_config` = ?");
            let r = serde_json::to_string(extra).map_err(|e| format!("Failed to serialize extra config: {}", e));
            if r.is_ok() {
                params.push(Value::String(r.unwrap()));
            }
        }
    }
    if let Some(config) = payload.get("config") {
        update_fields.push("`config` = ?");
        params.push(config.clone());
    }

    if update_fields.is_empty() {
        return Ok(json!({
            "code": 301,
            "msg": "No update fields",
            "data": Value::Null
        }));
    }

    let sql = format!(
        "UPDATE `LLM_AGENT` SET {} WHERE `id` = ?",
        update_fields.join(", ")
    );

    println!("sql: {:?} {:?}", sql, params);

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
            Value::Bool(b) => query.bind(if b { 1 } else { 0 }),
            _ => query,
        };
    }
    
    // 绑定 id 参数
    query = query.bind(id);

    let r = query.execute(db).await
        .map_err(|e| format!("Failed to update agent {}", e));

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
pub async fn find_llm_agent_by_id(id: i64, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let r = sqlx::query_as::<_, LLMAgentRecord>("SELECT * FROM `LLM_AGENT` WHERE `id` = ?")
        .bind(id)
        .fetch_one(db)
        .await
        .map_err(|e| format!("Failed to find agent {}", e));
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }
    let agent: LLMAgentRecord = r.unwrap();
    Ok(json!({
        "code": 0,
        "data": {
            "id": agent.id,
            "name": agent.name,
            "desc": agent.desc,
            "prompt": agent.prompt,
            "tags": agent.tags,
            "agent_type": agent.agent_type,
            "llm_config": agent.llm_config,
            "llm_provider_id": agent.llm_provider_id,
            "llm_model_id": agent.llm_model_id,
            "builtin": agent.builtin,
            "config": agent.config,
            "created_at": agent.created_at
        }
    }))
}



#[tauri::command(rename_all = "snake_case")]
pub async fn find_llm_agent_by_name(name: String, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let r = sqlx::query_as::<_, LLMAgentRecord>("SELECT * FROM `LLM_AGENT` WHERE `name` = ?")
        .bind(name)
        .fetch_one(db)
        .await
        .map_err(|e| format!("Failed to find agent {}", e));
    if r.is_err() {
        return Ok(json!({
            "code": 301,
            "msg": r.err().unwrap().to_string(),
            "data": Value::Null
        }));
    }
    let agent: LLMAgentRecord = r.unwrap();
    Ok(json!({
        "code": 0,
        "data": {
            "id": agent.id,
            "name": agent.name,
            "desc": agent.desc,
            "prompt": agent.prompt,
            "tags": agent.tags,
            "agent_type": agent.agent_type,
            "llm_config": agent.llm_config,
            "llm_provider_id": agent.llm_provider_id,
            "llm_model_id": agent.llm_model_id,
            "builtin": agent.builtin,
            "config": agent.config,
            "created_at": agent.created_at
        }
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_llm_agent(payload: Value, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;

    let name = payload.get("name").unwrap().as_str();
    let desc = payload.get("desc").unwrap().as_str();
    let prompt = payload.get("prompt").unwrap().as_str();

    let mut llm_provider_id = "";
    let mut llm_model_id = "";
    let mut llm_config = String::from("{}");
    if let Some(llm) = payload.get("llm") {
        if let Some(provider_id) = llm.get("provider_id") {
            llm_provider_id = provider_id.as_str().unwrap();
        }
        if let Some(model_id) = llm.get("model_id") {
            llm_model_id = model_id.as_str().unwrap();
        }
        if let Some(extra) = llm.get("extra") {
            let r = serde_json::to_string(extra).map_err(|e| format!("Failed to serialize extra config: {}", e));
            if r.is_ok() {
                llm_config = r.unwrap();
            }
        }
    }

    let r = sqlx::query("INSERT INTO `LLM_AGENT` (`name`, `desc`, `prompt`, `tags`, `agent_type`, `llm_config`, `llm_provider_id`, `llm_model_id`, `builtin`, `config`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(name)
        .bind(desc)
        .bind(prompt)
        .bind("")
        .bind(1)
        .bind(llm_config)
        .bind(llm_provider_id)
        .bind(llm_model_id)
        .bind(0)
        .bind("{}")
        .execute(db)
        .await
        .map_err(|e| format!("Failed to create agent {}", e));

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
pub async fn delete_llm_agent(id: i64, state: tauri::State<'_, AppState>) -> Result<Value, Error> {
    let db = &state.db;
    let r = sqlx::query("DELETE FROM `LLM_AGENT` WHERE `id` = ?")
        .bind(id)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to delete agent {}", e));
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
