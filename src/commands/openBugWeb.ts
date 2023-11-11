import * as vscode from "vscode";
import { BugItem } from "../tree-views/bugs";

export const openBugWeb = (bugId: number | BugItem) => {
  let parsedBugId: number | undefined = undefined;

  if (bugId instanceof BugItem && bugId.command && bugId.command.arguments) {
    parsedBugId = bugId.command?.arguments[0];
  }

  let url = new URL(`https://bugzilla.altlinux.org/${parsedBugId ?? bugId}`);

  vscode.env.openExternal(vscode.Uri.parse(url.href));
};
