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
    expertises?: string[];
    role?: "admin" | "user";
    createdAt?: any;
    linkedinUrl?: string;
    contactPreferences?: {
        email: boolean;
        linkedin: boolean;
        phone?: boolean;
    };
    projectHistory?: ProjectHistory[];
    phone?: string;
    [key: string]: any; // Allow additional properties from Firestore
}

export interface ProjectHistory {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    role: string;
    technologies?: string[];
    url?: string;
}
