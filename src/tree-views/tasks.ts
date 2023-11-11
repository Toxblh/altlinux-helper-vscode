// tasks.ts

import * as vscode from "vscode";
import axios from "axios";
import { TaskPayload, Task } from "../types/tasks";

const URL = "https://rdb.altlinux.org/api/site/tasks_by_package";

export class TasksService {
  componentFilter: string | null = null;

  public async getTasks(): Promise<Task[]> {
    if (!this.componentFilter) {
      return [];
    }

    const url = `${URL}?name=${this.componentFilter}`;

    try {
      const response = await axios.get(url);
      const data = response.data as TaskPayload;
      return data.tasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  public setComponentFilter(name: string | null): void {
    this.componentFilter = name;
  }
}

export class TaskItem extends vscode.TreeItem {
  constructor(task: Task) {
    super(task.state, vscode.TreeItemCollapsibleState.None);
    this.description = `#${task.id} - ${task.branch}`;

    this.command = {
      command: "altlinux-helper.task-open-inside",
      title: "Open Task",
      arguments: [task.id],
    };

    switch (task.state) {
      case "DONE":
        this.iconPath = new vscode.ThemeIcon(
          "check",
          new vscode.ThemeColor("testing.iconPassed")
        );
        break;
      case "TESTED":
        this.iconPath = new vscode.ThemeIcon(
          "check",
          new vscode.ThemeColor("testing.iconPassed")
        );
        break;
      case "FAILED":
        this.iconPath = new vscode.ThemeIcon(
          "testing-failed-icon",
          new vscode.ThemeColor("testing.iconFailed")
        );
        break;
      case "RUNNING":
        this.iconPath = new vscode.ThemeIcon(
          "debug-start",
          new vscode.ThemeColor("testing.runAction")
        );
        break;
      case "NEW":
        this.iconPath = new vscode.ThemeIcon(
          "testing-run-icon",
          new vscode.ThemeColor("testing.runAction ")
        );
        break;
      default:
        this.iconPath = new vscode.ThemeIcon("bug");
    }

    this.contextValue = "task";
    this.tooltip = `Owner: ${task.owner}\nLast Change: ${task.changed}`;
  }
}

export class TasksList implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    vscode.TreeItem | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private tasksService = new TasksService();

  public getTasksService(): TasksService {
    return this.tasksService;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const tasks = await this.tasksService.getTasks();

    if (!tasks || tasks.length === 0) {
      return [new vscode.TreeItem("No tasks found")];
    }

    return tasks.map((task) => new TaskItem(task));
  }
}
