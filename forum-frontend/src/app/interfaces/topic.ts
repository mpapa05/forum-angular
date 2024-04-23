import { User } from "./user";
import { Comment } from "./comment";

export interface TopicResponse {
    status: number,
    message: string,
    data: Topic[],
}

export interface Topic {
    id: number;
    author: User;
    title: string;
    body: string;
    removed?: boolean;
    comments?: Comment[];
    expanded?: boolean;
}