from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def enviar_confirmacion_cita(appointment):
    """
    Envía confirmación de cita por WhatsApp usando Twilio
    """
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        mensaje = f"""✅ *CITA CONFIRMADA*

Hola {appointment.client.name},

Tu cita ha sido confirmada:
📅 Fecha: {appointment.date.strftime('%d/%m/%Y')}
⏰ Hora: {appointment.time.strftime('%H:%M')}
💼 Servicio: {appointment.service.name}
💰 Precio: ${appointment.service.price}

📍 Dirección: [Tu dirección aquí]
📞 Contacto: {settings.WHATSAPP_BUSINESS_PHONE}

¡Te esperamos!

---
Para cancelar o reagendar, responde a este mensaje."""

        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            body=mensaje,
            to=f'whatsapp:{appointment.client.phone}'
        )
        
        # Actualizar el estado de confirmación
        appointment.confirmation_sent = True
        appointment.save()
        
        logger.info(f"Confirmación enviada a {appointment.client.name} - SID: {message.sid}")
        return message
        
    except Exception as e:
        logger.error(f"Error enviando confirmación WhatsApp: {str(e)}")
        raise e

def enviar_recordatorio_cita(appointment):
    """
    Envía recordatorio de cita por WhatsApp usando Twilio
    """
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        mensaje = f"""🔔 *RECORDATORIO DE CITA*

Hola {appointment.client.name},

Te recordamos tu cita para mañana:
📅 {appointment.date.strftime('%d/%m/%Y')}
⏰ {appointment.time.strftime('%H:%M')}
💼 {appointment.service.name}

¿Podrás asistir? Responde:
• *SI* para confirmar
• *NO* para cancelar
• *REAGENDAR* para cambiar fecha

¡Te esperamos!"""

        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            body=mensaje,
            to=f'whatsapp:{appointment.client.phone}'
        )
        
        appointment.reminder_sent = True
        appointment.save()
        
        logger.info(f"Recordatorio enviado a {appointment.client.name} - SID: {message.sid}")
        return message
        
    except Exception as e:
        logger.error(f"Error enviando recordatorio WhatsApp: {str(e)}")
        raise e

def enviar_mensaje_personalizado(phone, mensaje):
    """
    Envía un mensaje personalizado por WhatsApp
    """
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            body=mensaje,
            to=f'whatsapp:{phone}'
        )
        
        logger.info(f"Mensaje personalizado enviado a {phone} - SID: {message.sid}")
        return message
        
    except Exception as e:
        logger.error(f"Error enviando mensaje personalizado: {str(e)}")
        raise e