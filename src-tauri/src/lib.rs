mod actions;
mod commands;
mod store;

use commands::AppState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let store = store::load_store();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            store: Mutex::new(store),
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_projects,
            commands::add_project,
            commands::update_project,
            commands::delete_project,
            commands::run_action,
            commands::get_available_actions,
            commands::pick_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
