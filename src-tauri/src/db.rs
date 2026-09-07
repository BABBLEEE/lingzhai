use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Excerpt {
    pub id: i64,
    pub content: String,
    pub note: Option<String>,
    pub tags: Vec<String>,
    pub starred: i32,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewExcerpt {
    pub content: String,
    pub note: Option<String>,
    pub tags: Vec<String>,
    pub starred: i32,
    pub created_at: String,
}

pub fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS excerpts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            note TEXT,
            tags TEXT DEFAULT '[]',
            starred INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

fn row_to_excerpt(row: &rusqlite::Row) -> Result<Excerpt, rusqlite::Error> {
    let tags_json: String = row.get("tags")?;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
    Ok(Excerpt {
        id: row.get("id")?,
        content: row.get("content")?,
        note: row.get("note")?,
        tags,
        starred: row.get("starred")?,
        created_at: row.get("created_at")?,
    })
}

#[tauri::command]
pub fn get_all_excerpts(state: State<Mutex<Connection>>) -> Result<Vec<Excerpt>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, content, note, tags, starred, created_at FROM excerpts ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], row_to_excerpt)
        .map_err(|e| e.to_string())?;
    let mut excerpts = Vec::new();
    for row in rows {
        excerpts.push(row.map_err(|e| e.to_string())?);
    }
    Ok(excerpts)
}

#[tauri::command]
pub fn insert_excerpt(state: State<Mutex<Connection>>, excerpt: NewExcerpt) -> Result<i64, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let tags_json = serde_json::to_string(&excerpt.tags).unwrap();
    conn.execute(
        "INSERT INTO excerpts (content, note, tags, starred, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![excerpt.content, excerpt.note, tags_json, excerpt.starred, excerpt.created_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_excerpt(state: State<Mutex<Connection>>, excerpt: Excerpt) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let tags_json = serde_json::to_string(&excerpt.tags).unwrap();
    conn.execute(
        "UPDATE excerpts SET content = ?1, note = ?2, tags = ?3, starred = ?4, created_at = ?5 WHERE id = ?6",
        params![excerpt.content, excerpt.note, tags_json, excerpt.starred, excerpt.created_at, excerpt.id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_excerpt(state: State<Mutex<Connection>>, id: i64) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM excerpts WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_all_excerpts(state: State<Mutex<Connection>>) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM excerpts", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn export_data(state: State<Mutex<Connection>>, format: String) -> Result<String, String> {
    let excerpts = get_all_excerpts(state)?;
    if format == "json" {
        serde_json::to_string_pretty(&excerpts).map_err(|e| e.to_string())
    } else if format == "txt" {
        let mut txt = String::new();
        for e in excerpts {
            txt.push_str(&format!("[{}]\n{}\n", e.created_at, e.content));
            if let Some(note) = e.note {
                txt.push_str(&format!("笔记: {}\n", note));
            }
            if !e.tags.is_empty() {
                txt.push_str(&format!("标签: {}\n", e.tags.join(", ")));
            }
            txt.push_str("\n");
        }
        Ok(txt)
    } else {
        Err("Unsupported format".into())
    }
}

#[tauri::command]
pub fn import_data(state: State<Mutex<Connection>>, json_data: String, mode: String) -> Result<(), String> {
    let excerpts: Vec<Excerpt> = serde_json::from_str(&json_data).map_err(|e| e.to_string())?;
    let conn = state.lock().map_err(|e| e.to_string())?;
    if mode == "overwrite" {
        conn.execute("DELETE FROM excerpts", [])
            .map_err(|e| e.to_string())?;
    }
    for e in excerpts {
        let tags_json = serde_json::to_string(&e.tags).unwrap();
        conn.execute(
            "INSERT INTO excerpts (content, note, tags, starred, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![e.content, e.note, tags_json, e.starred, e.created_at],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}