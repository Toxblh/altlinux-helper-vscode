import * as vscode from "vscode";
import { TaskInfoPayload } from "../types/task-info";

export async function taskDetailsPanel(
  taskId: number,
  context: vscode.ExtensionContext
) {
  const iconPath = vscode.Uri.file(
    context.asAbsolutePath("assets/logo.svg")
  );

  const panel = vscode.window.createWebviewPanel(
    "taskDetails",
    `Task #${taskId}`,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true, // сохранение контекста при скрытии панели
    }
  );

  // Сначала устанавливаем HTML с сообщением о загрузке
  panel.iconPath = iconPath;
  panel.webview.html = loadingContent();

  try {
    const taskPromise = fetch(
      `https://rdb.altlinux.org/api/task/task_info/${taskId}`
    );

    // Дожидаемся выполнения обоих промисов
    const [TasksResponse] = await Promise.all([taskPromise]);

    if (!TasksResponse.ok) {
      throw new Error(`HTTP error! Status: ${TasksResponse.status}`);
    }

    const taskDetails = (await TasksResponse.json()) as TaskInfoPayload;

    // Показываем содержимое с деталями и комментариями
    panel.webview.html = generateTaskDetailsHtml(taskDetails);
  } catch (error) {
    panel.webview.html = `Failed to load task details: ${error}`;
  }
}

const generateTaskDetailsHtml = (taskDetails: TaskInfoPayload): string => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Details</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background: #f4f7f6;
      color: #444;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .task-header {
      border-bottom: 2px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .task-info {
      margin-bottom: 10px;
    }
    .label {
      display: inline-block;
      background: #7f8c8d;
      color: #fff;
      border-radius: 5px;
      padding: 3px 7px;
      font-size: 0.8em;
      margin-right: 5px;
    }
    .subtask {
      background: #ecf0f1;
      border-left: 4px solid #3498db;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .subtask + .subtask {
      border-left-color: #9b59b6;
    }
    .subtask-header {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .subtask-detail {
      margin-bottom: 5px;
      color: #2c3e50;
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="task-header">
        <h1>Task ID: ${taskDetails.id} - ${taskDetails.state}</h1>
        <div>
          <span class="label">Branch</span> ${taskDetails.branch}
        </div>
        <div>
          <span class="label">Version</span> ${taskDetails.version}
        </div>
        <div>
          <span class="label">Last Changed</span> ${taskDetails.last_changed}
        </div>
      </div>
  
      <div>
        <h2>General Information</h2>
        
        <div class="task-info">
          <span class="label">User</span> ${taskDetails.user}
        </div>
        <div class="task-info">
          <span class="label">Run By</span> ${taskDetails.runby}
        </div>
        <!-- Add more general task info if desired -->
      </div>
  
      <h2>Subtasks</h2>
      ${taskDetails.subtasks.map(subtask => `
        <div class="subtask">
          <div class="subtask-header">Subtask ${subtask.subtask_id}</div>
          <div class="subtask-detail">Type: ${subtask.type}</div>
          <div class="subtask-detail">User ID: ${subtask.userid}</div>
          <!-- Add more subtask details here -->
        </div>
      `).join('')}
      
      <!-- You would repeat a similar mapping for plans (add/del), and other sub-details
           you wish to include from the taskDetails object -->
    </div>
  </body>
  </html>
    `;
  };


function loadingContent() {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src https:; style-src 'unsafe-inline';"
      />
    </head>
    <body>
      <div id="loader" style="display: flex; justify-content: center">
        <p>Загрузка, ожидайте...</p>
      </div>
    </body>
  </html>
`;
}
