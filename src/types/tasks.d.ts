export interface Task {
  id: number;
  state: string;
  branch: string;
  owner: string;
  changed: string;
  packages: Package[];
}

export interface Package {
  type: string;
  name: string;
  version: string;
  release: string;
  link: string;
}

export interface TaskPayload {
  request_args: {};
  length: number;
  tasks: Task[];
}
