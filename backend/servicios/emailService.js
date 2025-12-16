/**
 * Servicio de Envío de Correos Electrónicos
 * Maneja el envío de diferentes tipos de notificaciones por email
 */

const transporter = require('../config/emailConfig');

// Configuración del remitente
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@22130804ehr.jcarlos19.com';
const FROM_NAME = process.env.FROM_NAME || 'Red Social de Libros';

/**
 * Plantilla base HTML para los correos
 */
const emailTemplate = (title, content, buttonText = null, buttonLink = null) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f3d2e 0%, #1a5940 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">📚 ${FROM_NAME}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    ${buttonText && buttonLink ? `
                    <!-- Button -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <a href="${buttonLink}" style="display: inline-block; background: linear-gradient(135deg, #0f3d2e 0%, #1a5940 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                ${buttonText}
                            </a>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fbf8; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                Este es un correo automático, por favor no responder.
                            </p>
                            <p style="margin: 10px 0 0; color: #999; font-size: 11px;">
                                © ${new Date().getFullYear()} Red Social de Libros. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Enviar correo de bienvenida a nuevo usuario
 */
const enviarCorreoBienvenida = async (usuario) => {
    const content = `
        <h2 style="color: #0f3d2e; margin-top: 0;">¡Bienvenido/a, ${usuario.nombre}!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Estamos emocionados de tenerte en nuestra comunidad de amantes de los libros. 
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
            En <strong>Red Social de Libros</strong> podrás:
        </p>
        <ul style="color: #555; font-size: 15px; line-height: 1.8;">
            <li>📖 Compartir tus lecturas favoritas</li>
            <li>💬 Comentar y discutir sobre libros</li>
            <li>👥 Seguir a otros lectores</li>
            <li>❤️ Dar like a las publicaciones que te gusten</li>
            <li>🔔 Recibir notificaciones de tus interacciones</li>
        </ul>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
            ¡Comienza a explorar y conecta con otros amantes de la lectura!
        </p>
    `;

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: usuario.email,
        subject: `¡Bienvenido/a a ${FROM_NAME}! 📚`,
        html: emailTemplate('Bienvenida', content, 'Ir a la aplicación', process.env.FRONTEND_URL || 'http://localhost:3000')
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de bienvenida enviado a ${usuario.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo de bienvenida a ${usuario.email}:`, error);
        return false;
    }
};

/**
 * Enviar correo de notificación de nuevo seguidor
 */
const enviarCorreoNuevoSeguidor = async (receptor, emisor) => {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; background: linear-gradient(135deg, #0f3d2e 0%, #1a5940 100%); display: flex; align-items: center; justify-content: center; font-size: 40px;">
                👤
            </div>
        </div>
        <h2 style="color: #0f3d2e; margin-top: 0; text-align: center;">¡Tienes un nuevo seguidor!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
            <strong>${emisor.nombre}</strong> ha comenzado a seguirte.
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
            Visita tu perfil para ver todos tus seguidores y descubre qué están leyendo.
        </p>
    `;

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: receptor.email,
        subject: `${emisor.nombre} comenzó a seguirte 👤`,
        html: emailTemplate('Nuevo Seguidor', content, 'Ver mi perfil', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/perfil`)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de nuevo seguidor enviado a ${receptor.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo de seguidor a ${receptor.email}:`, error);
        return false;
    }
};

/**
 * Enviar correo de notificación de like en post
 */
const enviarCorreoLike = async (receptor, emisor, post) => {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); display: flex; align-items: center; justify-content: center; font-size: 40px;">
                ❤️
            </div>
        </div>
        <h2 style="color: #0f3d2e; margin-top: 0; text-align: center;">¡A alguien le gustó tu publicación!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
            <strong>${emisor.nombre}</strong> le dio like a tu post.
        </p>
        ${post.contenido ? `
        <div style="background-color: #f8fbf8; border-left: 4px solid #0f3d2e; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #555; font-size: 14px; margin: 0; font-style: italic;">
                "${post.contenido.substring(0, 200)}${post.contenido.length > 200 ? '...' : ''}"
            </p>
        </div>
        ` : ''}
    `;

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: receptor.email,
        subject: `${emisor.nombre} le dio like a tu publicación ❤️`,
        html: emailTemplate('Nuevo Like', content, 'Ver publicación', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/home`)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de like enviado a ${receptor.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo de like a ${receptor.email}:`, error);
        return false;
    }
};

/**
 * Enviar correo de notificación de comentario en post
 */
const enviarCorreoComentario = async (receptor, emisor, post, comentario) => {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); display: flex; align-items: center; justify-content: center; font-size: 40px;">
                💬
            </div>
        </div>
        <h2 style="color: #0f3d2e; margin-top: 0; text-align: center;">¡Nuevo comentario en tu publicación!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
            <strong>${emisor.nombre}</strong> comentó en tu post.
        </p>
        ${comentario ? `
        <div style="background-color: #e8f4f8; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">
                Comentario:
            </p>
            <p style="color: #555; font-size: 14px; margin: 10px 0 0; font-style: italic;">
                "${comentario.substring(0, 200)}${comentario.length > 200 ? '...' : ''}"
            </p>
        </div>
        ` : ''}
        ${post.contenido ? `
        <div style="background-color: #f8fbf8; border-left: 4px solid #0f3d2e; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">
                Tu publicación:
            </p>
            <p style="color: #555; font-size: 14px; margin: 10px 0 0;">
                "${post.contenido.substring(0, 200)}${post.contenido.length > 200 ? '...' : ''}"
            </p>
        </div>
        ` : ''}
    `;

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: receptor.email,
        subject: `${emisor.nombre} comentó en tu publicación 💬`,
        html: emailTemplate('Nuevo Comentario', content, 'Ver comentario', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/home`)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de comentario enviado a ${receptor.email}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo de comentario a ${receptor.email}:`, error);
        return false;
    }
};

module.exports = {
    enviarCorreoBienvenida,
    enviarCorreoNuevoSeguidor,
    enviarCorreoLike,
    enviarCorreoComentario
};

