import * as vscode from "vscode";
import { BugsPayload } from "../types/bugs";

const URL = "https://bugzilla.altlinux.org/rest/bug";
const PRODUCT = "Sisyphus";

export class BugzillaService {
  componentFilter: string | null = null;

  public async getBugs(): Promise<Bug[]> {
    if (!this.componentFilter) {
      return [];
    }

    const url = `${URL}?component=${this.componentFilter}&component_type=equals&human=1&product=${PRODUCT}&query_format=advanced&simple=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = (await response.json()) as BugsPayload;

      const bugs = data.bugs.map((bug: any) => ({
        id: bug.id,
        summary: bug.summary,
        is_open: bug.status !== "RESOLVED" && bug.status !== "CLOSED",
      }));

      // Sort the bugs by isOpen first, then by ID
      bugs.sort((a, b) => {
        if (a.is_open && !b.is_open) {
          return -1;
        } else if (!a.is_open && b.is_open) {
          return 1;
        } else {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
        }
      });

      return bugs;
    } catch (error) {
      console.error("Error loading bugs:", error);
      return []; // Return an empty array if there's an error
    }
  }

  public setComponentFilter(component: string | null): void {
    this.componentFilter = component;
  }
}

// Define the Bug interface for type-checking
export interface Bug {
  id: number;
  summary: string;
  is_open: boolean;
}

export class BugList implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    vscode.TreeItem | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private bugzillaService = new BugzillaService();

  public getBugzillaService(): BugzillaService {
    return this.bugzillaService;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (element instanceof BugItem) {
      // If we have child elements for a bug, they would be processed here
      return [];
    } else {
      // Fetch the list of bugs from Bugzilla with the current component filter
      const bugs = await this.bugzillaService.getBugs();

      if (this.bugzillaService.componentFilter === null) {
        return [new vscode.TreeItem("Spec file not found")];
      }

      if (bugs.length === 0) {
        return [new vscode.TreeItem("No bugs found")];
      }

      return bugs.map((bug) => new BugItem(bug));
    }
  }
}

export class BugItem extends vscode.TreeItem {
  constructor(bug: Bug) {
    super(bug.summary, vscode.TreeItemCollapsibleState.None);
    this.description = `#${bug.id}`;

    this.command = {
      command: "altlinux-helper.bug-open-inside",
      title: "Open Bug",
      arguments: [bug.id],
    };

    this.iconPath = bug.is_open
      ? new vscode.ThemeIcon(
          "bug",
          new vscode.ThemeColor("editorWarning.foreground")
        )
      : new vscode.ThemeIcon("check");

    this.contextValue = "bug";
  }
}
