/**
 * Configuración de Email con Nodemailer
 * Usa el servidor Postfix local configurado en Oracle Cloud
 */

const nodemailer = require('nodemailer');

// Configuración del transporter usando el Postfix local
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 25,
    secure: false, // true para puerto 465, false para otros puertos
    tls: {
        rejectUnauthorized: false // Aceptar certificados autofirmados
    },
    // Si necesitas autenticación SMTP, descomenta estas líneas:
    // auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    // }
});

// Verificar conexión al iniciar
transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Error al conectar con el servidor de correo:', error);
    } else {
        console.log('✅ Servidor de correo listo para enviar mensajes');
    }
});

module.exports = transporter;

