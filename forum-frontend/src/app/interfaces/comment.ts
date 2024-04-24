import { User } from "./user";

export interface Comment {
    id: number;
    body: string;
    author: User;
    removed?: boolean;
    comments?: Comment[];
    expanded?: boolean;
}

export interface TopicCommentInput {
    body: string;
    author: {
        id: number;
        name: string;
        email: string;
        role: number;
    };
}
