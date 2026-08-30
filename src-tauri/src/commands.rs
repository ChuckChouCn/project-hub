use crate::actions;
use crate::store::{self, NewProject, Project, UpdateProject};
use tauri::State;
use std::sync::Mutex;

pub struct AppState {
    pub store: Mutex<store::Store>,
}

#[tauri::command]
pub fn list_projects(state: State<AppState>) -> Vec<Project> {
    let store = state.store.lock().unwrap();
    store.projects.clone()
}

#[tauri::command]
pub fn add_project(state: State<AppState>, project: NewProject) -> Result<Project, String> {
    let mut store = state.store.lock().unwrap();
    Ok(store.add(project))
}

#[tauri::command]
pub fn update_project(state: State<AppState>, id: String, update: UpdateProject) -> Result<Project, String> {
    let mut store = state.store.lock().unwrap();
    store.update(&id, update).ok_or_else(|| format!("项目不存在: {}", id))
}

#[tauri::command]
pub fn delete_project(state: State<AppState>, id: String) -> Result<bool, String> {
    let mut store = state.store.lock().unwrap();
    Ok(store.delete(&id))
}

#[tauri::command]
pub fn run_action(state: State<AppState>, id: String, action: String) -> Result<String, String> {
    let store = state.store.lock().unwrap();
    let project = store.get(&id).ok_or_else(|| format!("项目不存在: {}", id))?.clone();
    drop(store);
    match actions::execute(&project, &action) {
        actions::ActionResult::Success => Ok(format!("{} 执行成功", action)),
        actions::ActionResult::Error(e) => Err(e),
    }
}

#[tauri::command]
pub fn get_available_actions() -> Vec<serde_json::Value> {
    actions::available_actions()
        .iter()
        .map(|a| serde_json::json!({
            "key": a.key,
            "label": a.label,
            "icon": a.icon,
        }))
        .collect()
}

#[tauri::command]
pub fn pick_folder() -> Option<String> {
    // Use native folder picker via tauri-plugin-dialog
    // This is a fallback; the frontend uses the dialog plugin directly
    None
}
