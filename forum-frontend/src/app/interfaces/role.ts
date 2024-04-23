export interface RoleResponse {
    status: number,
    message: string,
    data: Role,
}

export interface Role {
    id: number;
    name: string;
    rights: number;
}

export const Roles = [ 'Administrators', 'Guests', 'Silver users', 'Gold users' ];
    
