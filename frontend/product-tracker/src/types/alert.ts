import { FormError } from "./form-error";

export type AlertType =  "danger" | "warning" | "info";

//Establece una relacion entre el Obj ErrorAlertMap y FormError, AlertType
//Key only FormError["typeError"] -> Conocido
//Value only AlertType
export const ErrorAlertMap = {
    required: "danger",
    notEquals: "danger",
    form: "warning",
    server: "danger"
} satisfies Record<FormError["typeError"], AlertType>;