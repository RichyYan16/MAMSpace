export interface Education {
    degree: string;
    institution: string;
    year: string;
}

export interface User {
    id?: number;
    uid?: string;
    name?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    education?: Education[];
    roles?: string[];
    role?: "admin" | "user";
    createdAt?: any;
    [key: string]: any; // Allow additional properties from Firestore
}
