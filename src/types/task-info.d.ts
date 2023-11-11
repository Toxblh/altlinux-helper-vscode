type Package = {
    name: string;
    version: string;
    release: string;
    filename: string;
  };
  
  type Approval = {
    date: string;
    type: string;
    name: string;
    message: string;
  };
  
  type Arch = {
    last_changed: string;
    arch: string;
    status: string;
  };
  
  type Subtask = {
    subtask_id: number;
    last_changed: string;
    userid: string;
    type: string;
    sid: string;
    dir: string;
    package: string;
    tag_author: string;
    tag_name: string;
    tag_id: string;
    srpm: string;
    srpm_name: string;
    srpm_evr: string;
    pkg_from: string;
    source_package: Package;
    approvals: Approval[];
    archs: Arch[];
  };
  
  type PlanDetail = {
    src: Package[];
    bin: Package[];
  };
  
  type Plan = {
    add: PlanDetail;
    del: PlanDetail;
  };
  
  export type TaskInfoPayload = {
    id: number;
    prev: number;
    try: number;
    iter: number;
    rebuilds: string[];
    state: string;
    branch: string;
    user: string;
    runby: string;
    testonly: number;
    failearly: number;
    shared: number;
    depends: number[];
    message: string;
    version: string;
    last_changed: string;
    subtasks: Subtask[];
    plan: Plan;
  };