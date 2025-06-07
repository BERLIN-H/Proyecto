from celery import shared_task
from django.conf import settings
from datetime import date, timedelta
from .models import Appointment
from .whatsapp_service import enviar_recordatorio_cita
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_whatsapp_reminder(appointment_id):
    """Envía recordatorio individual por WhatsApp"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Usar la función del servicio
        message = enviar_recordatorio_cita(appointment)
        
        return f"Recordatorio enviado a {appointment.client.name} - SID: {message.sid}"
    
    except Appointment.DoesNotExist:
        return "Cita no encontrada"
    except Exception as e:
        logger.error(f"Error enviando recordatorio: {str(e)}")
        return f"Error enviando recordatorio: {str(e)}"

@shared_task
def send_daily_reminders():
    """Tarea que se ejecuta diariamente para enviar recordatorios"""
    tomorrow = date.today() + timedelta(days=1)
    
    appointments = Appointment.objects.filter(
        date=tomorrow,
        status='confirmed',
        reminder_sent=False
    )
    
    sent_count = 0
    for appointment in appointments:
        try:
            send_whatsapp_reminder.delay(appointment.id)
            sent_count += 1
        except Exception as e:
            logger.error(f"Error programando recordatorio para {appointment.id}: {str(e)}")
    
    return f"Programados {sent_count} recordatorios de {appointments.count()} citas"