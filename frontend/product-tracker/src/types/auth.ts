import { Role } from "../services/auth";

export type RegisterData = {
    name: string,
    email: String,
    password: String,
    confirmPassword: String,
    username: String
};

export type UpdateData = {
    name: string,
    email: string,
    username: string,
    roles: Array<Role>
};

export type ProfileData = {
    name: string,
    email: string,
    username: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: String
}

export type LoginData = {
    username: string,
    password: string
};