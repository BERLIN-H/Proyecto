from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from datetime import datetime
import logging

# Configurar logging
logger = logging.getLogger(__name__)

# Intentar importar Twilio (opcional si no está instalado)
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio no está instalado. Las funciones de WhatsApp no estarán disponibles.")

# Configuración de Twilio
TWILIO_ACCOUNT_SID = os.getenv('ACfd9f0ae64ac94e8ea3e984513ae83cd2')
TWILIO_AUTH_TOKEN = os.getenv('6fc6f37c5c7e66dcefed1c8ade06ad0d')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

def get_twilio_client():
    """Obtener cliente de Twilio configurado"""
    if not TWILIO_AVAILABLE:
        raise ValueError("Twilio no está instalado")
    
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
        raise ValueError("Configuración de Twilio incompleta")
    
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def format_phone_number(phone):
    """Formatear número de teléfono para WhatsApp"""
    if not phone:
        return None
    
    # Remover caracteres no numéricos
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    
    # Agregar código de país si no lo tiene (asumiendo Colombia +57)
    if len(clean_phone) == 10:
        clean_phone = '57' + clean_phone
    elif len(clean_phone) == 12 and clean_phone.startswith('57'):
        pass  # Ya tiene código de país
    elif clean_phone.startswith('1') and len(clean_phone) == 11:
        pass  # Número de EE.UU.
    
    return f'whatsapp:+{clean_phone}'

@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_confirmation(request):
    """Enviar mensaje de confirmación de cita por WhatsApp usando Twilio"""
    try:
        # Verificar si Twilio está disponible
        if not TWILIO_AVAILABLE:
            return JsonResponse({
                'success': False,
                'error': 'Servicio de WhatsApp no disponible. Twilio no está instalado.'
            }, status=503)
        
        # Parsear datos JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        
        # Obtener datos de la cita
        appointment_id = data.get('appointment_id')
        client_name = data.get('client_name')
        client_phone = data.get('client_phone')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        service_name = data.get('service_name', 'Consulta')
        
        # Validar datos requeridos
        if not all([client_name, client_phone, appointment_date, appointment_time]):
            return JsonResponse({
                'success': False,
                'error': 'Faltan datos requeridos: nombre, teléfono, fecha y hora son obligatorios'
            }, status=400)
        
        # Obtener cliente de Twilio
        try:
            client = get_twilio_client()
        except ValueError as e:
            logger.error(f"Error configuración Twilio: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Configuración de WhatsApp no disponible'
            }, status=500)
        
        # Formatear fecha para mostrar
        try:
            date_obj = datetime.strptime(appointment_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d de %B de %Y')
        except ValueError:
            formatted_date = appointment_date
        
        # Crear mensaje de confirmación
        message_body = f"""🎉 *¡Cita Confirmada!*

Hola {client_name}, tu cita ha sido confirmada exitosamente.

📅 *Fecha:* {formatted_date}
🕐 *Hora:* {appointment_time}
💼 *Servicio:* {service_name}

📍 *Dirección:* Calle Principal 123, Ciudad
📞 *Teléfono:* +57 300 123 4567

⚠️ *Importante:*
• Llega 15 minutos antes
• Trae tu documento de identidad
• Para cancelar, hazlo con 24h de anticipación

¡Te esperamos!

_Equipo MindCare_"""
        
        # Formatear número de teléfono
        to_whatsapp = format_phone_number(client_phone)
        if not to_whatsapp:
            return JsonResponse({
                'success': False,
                'error': f'Número de teléfono inválido: {client_phone}'
            }, status=400)
        
        # Enviar mensaje
        try:
            message = client.messages.create(
                body=message_body,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to_whatsapp
            )
            
            logger.info(f"WhatsApp enviado exitosamente. SID: {message.sid}")
            
            return JsonResponse({
                'success': True,
                'message': 'Mensaje de confirmación enviado por WhatsApp',
                'message_id': message.sid,
                'status': message.status
            })
            
        except Exception as e:
            logger.error(f"Error enviando WhatsApp: {e}")
            return JsonResponse({
                'success': False,
                'error': f'Error enviando WhatsApp: {str(e)}'
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error general en send_whatsapp_confirmation: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_reminder(request):
    """Enviar recordatorio de cita por WhatsApp"""
    try:
        # Verificar si Twilio está disponible
        if not TWILIO_AVAILABLE:
            return JsonResponse({
                'success': False,
                'error': 'Servicio de WhatsApp no disponible. Twilio no está instalado.'
            }, status=503)
        
        # Parsear datos JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        
        # Obtener datos
        client_name = data.get('client_name')
        client_phone = data.get('client_phone')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        service_name = data.get('service_name', 'Consulta')
        
        # Validar datos
        if not all([client_name, client_phone, appointment_date, appointment_time]):
            return JsonResponse({
                'success': False,
                'error': 'Faltan datos requeridos'
            }, status=400)
        
        # Obtener cliente de Twilio
        try:
            client = get_twilio_client()
        except ValueError as e:
            return JsonResponse({
                'success': False,
                'error': 'Configuración de WhatsApp no disponible'
            }, status=500)
        
        # Formatear fecha
        try:
            date_obj = datetime.strptime(appointment_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d de %B de %Y')
        except ValueError:
            formatted_date = appointment_date
        
        # Crear mensaje de recordatorio
        message_body = f"""⏰ *Recordatorio de Cita*

Hola {client_name}, te recordamos que tienes una cita programada.

📅 *Fecha:* {formatted_date}
🕐 *Hora:* {appointment_time}
💼 *Servicio:* {service_name}

📍 *Dirección:* Calle Principal 123, Ciudad

⚠️ *Recuerda:*
• Llegar 15 minutos antes
• Traer documento de identidad

Si necesitas reprogramar o cancelar, contáctanos lo antes posible.

¡Te esperamos!

_Equipo MindCare_"""
        
        # Formatear y enviar
        try:
            to_whatsapp = format_phone_number(client_phone)
            if not to_whatsapp:
                return JsonResponse({
                    'success': False,
                    'error': f'Número de teléfono inválido: {client_phone}'
                }, status=400)
            
            message = client.messages.create(
                body=message_body,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to_whatsapp
            )
            
            logger.info(f"Recordatorio WhatsApp enviado. SID: {message.sid}")
            
            return JsonResponse({
                'success': True,
                'message': 'Recordatorio enviado por WhatsApp',
                'message_id': message.sid
            })
            
        except Exception as e:
            logger.error(f"Error enviando recordatorio: {e}")
            return JsonResponse({
                'success': False,
                'error': f'Error enviando recordatorio: {str(e)}'
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error general en send_whatsapp_reminder: {e}")
        return JsonResponse({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def whatsapp_webhook(request):
    """Webhook para recibir respuestas de WhatsApp (opcional)"""
    try:
        # Twilio envía los datos como form data
        from_number = request.POST.get('From', '')
        body = request.POST.get('Body', '')
        message_sid = request.POST.get('MessageSid', '')
        
        logger.info(f"WhatsApp recibido de {from_number}: {body}")
        
        # Aquí puedes procesar las respuestas
        # Por ejemplo, si el usuario responde "CONFIRMAR" o "CANCELAR"
        
        if 'confirmar' in body.lower():
            # Lógica para confirmar cita
            pass
        elif 'cancelar' in body.lower():
            # Lógica para cancelar cita
            pass
        
        # Responder a Twilio (opcional)
        return JsonResponse({'status': 'received'})
        
    except Exception as e:
        logger.error(f"Error procesando webhook: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# Vista de prueba para verificar que todo funciona
@csrf_exempt
@require_http_methods(["GET"])
def test_whatsapp_config(request):
    """Endpoint para probar la configuración de WhatsApp"""
    try:
        if not TWILIO_AVAILABLE:
            return JsonResponse({
                'success': False,
                'error': 'Twilio no está instalado',
                'twilio_available': False
            })
        
        # Verificar configuración
        config_status = {
            'twilio_available': TWILIO_AVAILABLE,
            'account_sid_configured': bool(TWILIO_ACCOUNT_SID),
            'auth_token_configured': bool(TWILIO_AUTH_TOKEN),
            'whatsapp_number_configured': bool(TWILIO_WHATSAPP_NUMBER)
        }
        
        if all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
            try:
                client = get_twilio_client()
                # Intentar obtener información de la cuenta
                account = client.api.accounts(TWILIO_ACCOUNT_SID).fetch()
                config_status['account_status'] = account.status
                config_status['connection_test'] = 'success'
            except Exception as e:
                config_status['connection_test'] = f'failed: {str(e)}'
        else:
            config_status['connection_test'] = 'not_configured'
        
        return JsonResponse({
            'success': True,
            'config': config_status
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
