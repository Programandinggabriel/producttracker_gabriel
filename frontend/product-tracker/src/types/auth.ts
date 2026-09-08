import { AlertDirection, Role } from "../services/auth";
import { Provider } from "../services/products";

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


//FAVORITES

export type Favorite = {
    provider: String;
    external_id: String;
}

//PRICE ALERTS
export type CreatePriceAlert = {
    provider: String;
    external_id: String;
    direction: AlertDirection;
    price_target: string;
}

export type UpdatePriceAlert = {
    provider: Provider | null;
    current_price: string;
    currency: String;
    direction: AlertDirection;
    price_target: string;
    active: boolean;
}