import { Role } from "./role";

export interface UserWithRoleCommentsTopics {
    id: number;
    name: string;
    password: string;
    email: string;
    roleId: number;
    roleName: string;
    roleRights: number;
    commentsTotal: number;
    topicsTotal: number;
}

export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    role: number;
}

export interface UserResponse {
    status: number,
    message: string,
    data: User,
}

export interface UsersResponse {
    status: number,
    message: string,
    data: User[],
}