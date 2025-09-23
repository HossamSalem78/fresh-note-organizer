export interface UserInterface {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface LoginInterface {
    email: string;
    password: string;
}

export interface RegisterInterface {
    name: string;
    email: string;
    password: string;
}