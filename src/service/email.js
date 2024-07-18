//Email manager: Envios de emails
const nodemailer = require("nodemailer");
const { logger } = require("../utils/logger.js");


//Clase para el manejo de los emails, email de recuperación de contraseña
class EmailManager {
    constructor() {
        //Transporter: objeto de configuración con nuestro servicio de email
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: "boris.gilp@gmail.com",
                pass: "ufhc auvf qduw nfwd"
            }
        });
    }

    //Metodo para el envio de email del resumen de la compra
    async purchaseEmail(email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Baris Gamer <boris.gilp@gmail.com>",
                to: email,
                subject: "Resumen de tu compra",
                html: ` <h1>Resumen de tu compra</h1>
                <p>Gracias por tu compra, ${first_name}</p> 
                <p>El número de tu orden es: ${ticket}</p>`
            }

            //Envio de email con le metodo sendMail
            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            logger.error("Eror al enviar el email del resumen de la compra:", error);
        }
    }

    //Metodo para el restablecimiento de contraseñas
    async resetPasswordEmail(email, user, resetToken) {
        
        try {
            const mailOptions = {
                from: "Baris Gamer <boris.gilp@gmail.com>",
                to: email,
                subject: "Restablecimiento de contraseña",
                html: `<h1>Restablece tu contraseña</h1>
                        <p>Hola ${user.first_name} ${user.last_name},</p>
                        <p>Solicitaste restablecer tu contraseña.</p>
                        <p><strong>Código de verificación: ${resetToken}</strong></p>
                        <p>El código expirará en 60 minutos. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
                        <a href="https://localhost:8080/change-password" style="display: inline-block; background-color: #4a148c; color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>`
            }

            //Envio de email con le metodo sendMail
            await this.transporter.sendMail(mailOptions)
            logger.info("Se envio el email de restablecimiento de contraseña correctamente");
    
        } catch (error) {
            logger.error("Error al enviar el email de restablecimiento de contraseña:", error);
            throw new Error("Error al enviar el email de restablecimiento de contraseña");
        }
    }
}

module.exports = EmailManager;