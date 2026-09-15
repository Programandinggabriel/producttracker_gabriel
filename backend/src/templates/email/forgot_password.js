import { config } from 'dotenv'
config()
export const TemplateEmailForgorPassword = (user, token) => {
    return `
        <p>Hola ${user.name}.</p>
        <p>Aquí tienes el enlace para restablecer tu contraseña</p>
        <p>${process.env.FRONTEND_URL}/forgot-password/${token}</p>
    `
}