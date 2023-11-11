import * as vscode from "vscode";
import { TaskItem } from "../tree-views/tasks";

export const openTaskById = (taskId: number | TaskItem) => {
  let parsedTaskId: number | undefined = undefined;

  if (taskId instanceof TaskItem && taskId.command && taskId.command.arguments) {
    parsedTaskId = taskId.command?.arguments[0];
  }

  let url = new URL(`https://packages.altlinux.org/ru/tasks/${parsedTaskId ?? taskId}`);

  vscode.env.openExternal(vscode.Uri.parse(url.href));
};
