const { emailConfig } = require('../../config/email')
let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.password
    }
});

const sendEmail = async (toEmail, subject, htmlContent) => {
    const mailOptions = {
        from: emailConfig.user,
        to: toEmail,
        subject: subject,
        html: htmlContent
    }

    await transporter.sendMail(mailOptions)
}

module.exports = {
    sendEmail
}