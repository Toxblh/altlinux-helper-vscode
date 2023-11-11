// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { BugList } from "./tree-views/bugs";
import { TasksList } from "./tree-views/tasks";
import { WorkspaceWatcher } from "./tree-views/workspaceWatcher";
import { openBugWeb } from "./commands/openBugWeb";
import { bugDetailsPanel } from "./commands/openBugInside";
import { openTaskById } from "./commands/openTaskById";
import { taskDetailsPanel } from "./commands/openTaskInside";

const bugs_list = new BugList();
const tasks_list = new TasksList();
const workspaceWatcher = new WorkspaceWatcher(
  bugs_list.getBugzillaService(),
  tasks_list.getTasksService()
);

export function activate(context: vscode.ExtensionContext) {
  workspaceWatcher.scan();

  vscode.window.registerTreeDataProvider("alt-bugs", bugs_list);
  vscode.window.registerTreeDataProvider("alt-tasks", tasks_list);

  vscode.commands.registerCommand("altlinux-helper.bug-open-web", openBugWeb);
  vscode.commands.registerCommand("altlinux-helper.task-open-web", openTaskById);

  vscode.commands.registerCommand(
    "altlinux-helper.bug-open-inside",
    (_id: number) => bugDetailsPanel(_id, context)
  );

  vscode.commands.registerCommand(
    "altlinux-helper.task-open-inside",
    (_id: number) => taskDetailsPanel(_id, context)
  );

  vscode.commands.registerCommand("altlinux-helper.bugs-refresh", () => {
    bugs_list.refresh();
  });

  vscode.commands.registerCommand("altlinux-helper.tasks-refresh", () => {
    tasks_list.refresh();
  });

}

// This method is called when your extension is deactivated
export function deactivate() {}
