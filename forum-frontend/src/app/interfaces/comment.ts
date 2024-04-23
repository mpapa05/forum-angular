import { User } from "./user";

export interface Comment {
    id: number;
    body: string;
    author: User;
    removed?: boolean;
    comments?: Comment[];
}
