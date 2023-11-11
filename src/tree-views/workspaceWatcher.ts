import { workspace, FileSystemWatcher } from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BugzillaService } from "./bugs";
import { TasksService } from "./tasks";

export class WorkspaceWatcher {
  private fileWatcher: FileSystemWatcher | undefined;
  private specFiles: string[] = [];
  private bugzillaService: BugzillaService;
  private tasksService: TasksService;

  constructor(bugzillaService: BugzillaService, tasksService: TasksService) {
    this.bugzillaService = bugzillaService;
    this.tasksService = tasksService;
  }

  setSpecFile(specFile: string): void {
    this.specFiles.push(specFile);

    if (!specFile) {
      throw new Error("No .spec file found in the root directory");
    }

    const specContent = fs.readFileSync(specFile, "utf8");

    // Extract the package name
    const packageName = specContent.match(/^Name:\s+(.*)$/m)?.[1];
    const componentFilter = packageName ?? null;

    this.bugzillaService.setComponentFilter(componentFilter);
    this.tasksService.setComponentFilter(componentFilter);
  }

  scan(): void {
    workspace.workspaceFolders?.forEach((folder) => {
        const files = fs.readdirSync(folder.uri.path);
  
        const specFile =
          files.find((file: string) => path.extname(file) === ".spec") || "";
  
        this.setSpecFile(path.join(folder.uri.path, specFile));
  
        this.fileWatcher = workspace.createFileSystemWatcher(specFile);
        this.fileWatcher.onDidChange(() => this.refresh());
      });
  }

  refresh(): void {
    this.scan();
  }
}
