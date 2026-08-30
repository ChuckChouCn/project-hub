use crate::store::Project;

pub enum ActionResult {
    Success,
    Error(String),
}

#[derive(Debug, Clone, Copy)]
pub struct ActionDef {
    pub key: &'static str,
    pub label: &'static str,
    pub icon: &'static str,
}

pub fn available_actions() -> Vec<ActionDef> {
    vec![
        ActionDef { key: "open-folder", label: "打开文件夹", icon: "folder-open" },
        ActionDef { key: "open-terminal", label: "终端打开", icon: "terminal" },
        ActionDef { key: "open-vscode", label: "VS Code", icon: "code" },
    ]
}

pub fn execute(project: &Project, action: &str) -> ActionResult {
    match action {
        "open-folder" => open_folder(project),
        "open-terminal" => open_terminal(project),
        "open-vscode" => open_vscode(project),
        _ => ActionResult::Error(format!("未知操作: {}", action)),
    }
}

fn open_folder(project: &Project) -> ActionResult {
    let path = &project.path;
    let result = std::process::Command::new("explorer")
        .arg(path)
        .spawn();
    match result {
        Ok(_) => ActionResult::Success,
        Err(e) => ActionResult::Error(format!("无法打开文件夹: {}", e)),
    }
}

fn open_terminal(project: &Project) -> ActionResult {
    let path = &project.path;
    let wt_result = std::process::Command::new("wt")
        .args(["-d", path])
        .spawn();
    match wt_result {
        Ok(_) => return ActionResult::Success,
        Err(_) => {}
    }
    let cmd_result = std::process::Command::new("cmd")
        .args(["/c", "start", "cmd.exe", "/k", &format!("cd /d {}", path)])
        .spawn();
    match cmd_result {
        Ok(_) => ActionResult::Success,
        Err(e) => ActionResult::Error(format!("无法打开终端: {}", e)),
    }
}

fn open_vscode(project: &Project) -> ActionResult {
    let path = &project.path;
    // Use cmd /c start so PATH is resolved from user's environment
    let result = std::process::Command::new("cmd")
        .args(["/c", "start", "code", path])
        .spawn();
    if result.is_ok() { return ActionResult::Success; }
    let result = std::process::Command::new("cmd")
        .args(["/c", "start", "code-insiders", path])
        .spawn();
    match result {
        Ok(_) => ActionResult::Success,
        Err(e) => ActionResult::Error(format!("无法打开 VS Code: {}", e)),
    }
}
