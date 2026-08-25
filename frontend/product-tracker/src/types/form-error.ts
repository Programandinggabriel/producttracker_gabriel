const AviableTypeError = {
    required: "required",
    notEquals: "notEquals",
    form: "form",
    server: "server"
} as const;

export type FormError = {
    typeError: typeof AviableTypeError[keyof typeof AviableTypeError];
    field: String;
    message: String;
}
