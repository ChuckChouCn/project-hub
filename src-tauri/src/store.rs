use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub alias: String,
    pub path: String,
    pub categories: Vec<String>,
    pub description: String,
    #[serde(default)]
    pub archived: bool,
    #[serde(default = "default_status")]
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewProject {
    pub name: String,
    pub alias: String,
    pub path: String,
    pub categories: Vec<String>,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProject {
    pub name: Option<String>,
    pub alias: Option<String>,
    pub path: Option<String>,
    pub categories: Option<Vec<String>>,
    pub description: Option<String>,
    pub archived: Option<bool>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Store {
    pub version: u32,
    pub projects: Vec<Project>,
}

fn data_path() -> PathBuf {
    dirs_next().join("project-hub").join("projects.json")
}

fn dirs_next() -> PathBuf {
    // Tauri v2: use app data dir via env or fallback
    std::env::var("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let home = std::env::var("USERPROFILE").unwrap_or_else(|_| ".".into());
            PathBuf::from(home).join("AppData").join("Roaming")
        })
}

pub fn load_store() -> Store {
    let path = data_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_else(|_| default_store_json());
        serde_json::from_str(&content).unwrap_or_else(|_| Store::default())
    } else {
        let store = Store::default();
        save_store(&store);
        store
    }
}

fn save_store(store: &Store) {
    let path = data_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).ok();
    }
    let content = serde_json::to_string_pretty(store).unwrap();
    fs::write(&path, content).ok();
}

fn default_store_json() -> String {
    r#"{"version":1,"projects":[]}"#.to_string()
}

fn default_status() -> String {
    "developing".to_string()
}

impl Default for Store {
    fn default() -> Self {
        Store {
            version: 1,
            projects: vec![],
        }
    }
}

impl Store {
    pub fn add(&mut self, new: NewProject) -> Project {
        let now = chrono::Utc::now().to_rfc3339();
        let project = Project {
            id: uuid::Uuid::new_v4().to_string(),
            name: new.name,
            alias: new.alias,
            path: new.path,
            categories: new.categories,
            description: new.description,
            archived: false,
            status: "developing".to_string(),
            created_at: now.clone(),
            updated_at: now,
        };
        self.projects.push(project.clone());
        save_store(self);
        project
    }

    pub fn update(&mut self, id: &str, update: UpdateProject) -> Option<Project> {
        let idx = self.projects.iter().position(|p| p.id == id)?;
        let p = &mut self.projects[idx];
        if let Some(ref name) = update.name { p.name = name.clone(); }
        if let Some(ref alias) = update.alias { p.alias = alias.clone(); }
        if let Some(ref path) = update.path { p.path = path.clone(); }
        if let Some(ref cats) = update.categories { p.categories = cats.clone(); }
        if let Some(ref desc) = update.description { p.description = desc.clone(); }
        if let Some(ref status) = update.status { p.status = status.clone(); }
        if let Some(archived) = update.archived { p.archived = archived; }
        // Status/archive invariants:
        // done ⇒ archived; developing ⇒ active (unarchived)
        if p.status == "done" { p.archived = true; }
        if p.status == "developing" { p.archived = false; }
        // Manual archive of an active project ⇒ paused;
        // unarchive of a done project ⇒ developing
        if let Some(archived) = update.archived {
            if archived && p.status == "developing" { p.status = "paused".to_string(); }
            if !archived && p.status == "done" { p.status = "developing".to_string(); }
        }
        p.updated_at = chrono::Utc::now().to_rfc3339();
        let cloned = p.clone();
        save_store(self);
        Some(cloned)
    }

    pub fn delete(&mut self, id: &str) -> bool {
        let len_before = self.projects.len();
        self.projects.retain(|p| p.id != id);
        if self.projects.len() != len_before {
            save_store(self);
            true
        } else {
            false
        }
    }

    pub fn get(&self, id: &str) -> Option<&Project> {
        self.projects.iter().find(|p| p.id == id)
    }
}
