/**use tauri::{AppHandle, Manager, Emitter};
use tauri_plugin_system_tray::{SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, SystemTrayExt};

pub fn create_tray(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let tray = SystemTray::new()
        .with_menu(
            SystemTrayMenu::new()
                .add_item("显示/隐藏", "toggle")
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item("开机自启", "autostart")
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item("退出", "quit")
        )
        .with_tooltip("灵摘");

    let _ = app_handle.system_tray().set_tray(tray)?;

    // 处理托盘事件
    let app_handle_clone = app_handle.clone();
    std::thread::spawn(move || {
        let mut event_stream = app_handle_clone.system_tray().event_rx();
        while let Some(event) = event_stream.blocking_recv() {
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    match id.as_str() {
                        "toggle" => {
                            let _ = app_handle_clone.emit("window-visible", true);
                            if let Some(window) = app_handle_clone.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "autostart" => {
                            let _ = toggle_autostart(&app_handle_clone);
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub fn toggle_window_visibility(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

#[tauri::command]
pub fn set_autostart(app_handle: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    if let Some(autostart) = app_handle.autostart() {
        if enabled {
            autostart.enable().map_err(|e| e.to_string())?;
        } else {
            autostart.disable().map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("Autostart plugin not available".into())
    }
}

fn toggle_autostart(app_handle: &AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    if let Some(autostart) = app_handle.autostart() {
        let enabled = autostart.is_enabled().unwrap_or(false);
        if enabled {
            autostart.disable().map_err(|e| e.to_string())?;
        } else {
            autostart.enable().map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("Autostart plugin not available".into())
    }
}*/