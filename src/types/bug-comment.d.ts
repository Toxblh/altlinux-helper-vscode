export interface BugCommentPayload {
    bugs:     Bugs;
}

export interface Bugs {
    [k: number]: Comments;
}

export interface Comments {
    comments: Comment[];
}

export interface Comment {
    attachment_id: number | null;
    bug_id:        number;
    count:         number;
    creation_time: Date;
    creator:       string;
    id:            number;
    is_private:    boolean;
    tags:          any[];
    text:          string;
    time:          Date;
}
