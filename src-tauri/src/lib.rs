pub mod db;
// pub mod tray;  // 暂时注释掉，因为系统托盘依赖有冲突

use tauri::Manager;
use std::sync::Mutex;
use rusqlite::Connection;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 初始化数据库
            let app_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_path = app_dir.join("lingzhai.db");
            let conn = Connection::open(&db_path).expect("failed to open database");
            db::init_db(&conn).expect("failed to init db");
            app.manage(Mutex::new(conn));

            // ===== 暂时注释掉全局快捷键（避免编译错误） =====
            /*
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, Modifiers, Code};
            let _ = app.handle().global_shortcut().register("Ctrl+Shift+L");
            app.handle().global_shortcut().on_shortcut("Ctrl+Shift+L", move |_| {
                let app_handle = app.handle().clone();
                let _ = app_handle.emit("window-visible", true);
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            });
            */

            // ===== 暂时注释掉托盘创建 =====
            // tray::create_tray(app.handle())?;

            Ok(())
        })
        // ===== 暂时注释掉不需要的插件 =====
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // .plugin(tauri_plugin_autostart::init(...))
        // .plugin(tauri_plugin_system_tray::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            db::get_all_excerpts,
            db::insert_excerpt,
            db::update_excerpt,
            db::delete_excerpt,
            db::delete_all_excerpts,
            db::export_data,
            db::import_data,
            // ===== 移除对 tray 函数的引用 =====
            // tray::toggle_window_visibility,
            // tray::set_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}