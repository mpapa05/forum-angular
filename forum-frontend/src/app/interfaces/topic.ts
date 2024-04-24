import { User } from "./user";
import { Comment } from "./comment";

export interface TopicResponse {
    status: number,
    message: string,
    data: Topic[],
}

export interface TopicsResponse {
    status: number,
    message: string,
    data: Topic[],
}

export interface Topic {
    id: number;
    author: User;
    title: string;
    body: string;
    comments?: Comment[] | [];
    removed?: boolean;
    expanded?: boolean;
}