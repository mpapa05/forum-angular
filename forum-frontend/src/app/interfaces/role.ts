export interface RoleResponse {
    status: number,
    message: string,
    data: Role,
}

export interface RolesResponse {
    status: number,
    message: string,
    data: Role[],
}

export interface Role {
    id: number;
    name: string;
    rights: number;
}

// Define a type for valid role names
export type RoleName = "Guests" | "Silver users" | "Gold users" | "Administrators" | "";

// Define the structure of a role's rights
interface RoleRightsType {
  "read-comments": boolean;
  "add-delete-comments": boolean;
  "add-delete-topics": boolean;
  "delete-others-comments-topics": boolean;
}

// Define the object with explicit type annotations
export const RoleRights: Record<RoleName, RoleRightsType> = {
    "Guests": {
        "read-comments": true,
        "add-delete-comments": false,
        "add-delete-topics": false,
        "delete-others-comments-topics": false,
    },
    "Silver users": {
        "read-comments": true,
        "add-delete-comments": true,
        "add-delete-topics": false,
        "delete-others-comments-topics": false,
    },
    "Gold users": {
        "read-comments": true,
        "add-delete-comments": true,
        "add-delete-topics": true,
        "delete-others-comments-topics": false,
    },
    "Administrators": {
        "read-comments": true,
        "add-delete-comments": true,
        "add-delete-topics": true,
        "delete-others-comments-topics": true,
    },
    "": {
        "read-comments": false,
        "add-delete-comments": false,
        "add-delete-topics": false,
        "delete-others-comments-topics": false,
    }
};

export const Roles = [ 'Administrators', 'Guests', 'Silver users', 'Gold users' ];
    
