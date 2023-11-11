export interface BugsPayload {
    bugs: Bug[];
}

export interface Bug {
    alias:                 any[];
    assigned_to:           string;
    assigned_to_detail:    Detail;
    blocks:                number[];
    cc:                    string[];
    cc_detail:             Detail[];
    classification:        string;
    component:             string;
    creation_time:         Date;
    creator:               string;
    creator_detail:        Detail;
    deadline:              null;
    depends_on:            number[];
    dupe_of:               number | null;
    flags:                 any[];
    groups:                any[];
    id:                    number;
    is_cc_accessible:      boolean;
    is_confirmed:          boolean;
    is_creator_accessible: boolean;
    is_open:               boolean;
    keywords:              any[];
    last_change_time:      Date;
    op_sys:                string;
    platform:              string;
    priority:              string;
    product:               string;
    qa_contact:            string;
    qa_contact_detail:     Detail;
    resolution:            string;
    see_also:              string[];
    severity:              string;
    status:                Status;
    summary:               string;
    target_milestone:      string;
    url:                   string;
    version:               string;
    whiteboard:            string;
}

export interface Detail {
    email:     string;
    id:        number;
    name:      string;
    real_name: string;
}

export enum Status {
    Closed = "CLOSED",
    New = "NEW",
    Resolved = "RESOLVED",
}