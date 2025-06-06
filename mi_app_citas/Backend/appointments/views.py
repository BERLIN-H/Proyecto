from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from datetime import datetime
import logging
from twilio.rest import Client  # Se asume que Twilio ya está instalado correctamente
from decouple import config


# Configurar logging
logger = logging.getLogger(__name__)

# Configuración de Twilio correctamente usando variables de entorno
from decouple import config

TWILIO_WHATSAPP_NUMBER = config('TWILIO_WHATSAPP_NUMBER')


def get_twilio_client():
    sid   = os.getenv('TWILIO_ACCOUNT_SID', '').strip()
    token = os.getenv('TWILIO_AUTH_TOKEN', '').strip()

    if not sid or not token:
        raise ValueError("SID o Auth Token vacío")

    return Client(sid, token)


def format_phone_number(phone):
    if not phone:
        return None
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    if len(clean_phone) == 10:
        clean_phone = '57' + clean_phone
    elif len(clean_phone) == 12 and clean_phone.startswith('57'):
        pass
    elif clean_phone.startswith('1') and len(clean_phone) == 11:
        pass
    return f'whatsapp:+{clean_phone}'

@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_confirmation(request):
    try:
        data = json.loads(request.body)
        appointment_id = data.get('appointment_id')
        client_name = data.get('client_name')
        client_phone = data.get('client_phone')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        service_name = data.get('service_name', 'Consulta')

        if not all([client_name, client_phone, appointment_date, appointment_time]):
            return JsonResponse({'success': False, 'error': 'Faltan datos requeridos'}, status=400)

        client = get_twilio_client()

        try:
            date_obj = datetime.strptime(appointment_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d de %B de %Y')
        except ValueError:
            formatted_date = appointment_date

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

        to_whatsapp = format_phone_number(client_phone)
        if not to_whatsapp:
            return JsonResponse({'success': False, 'error': 'Número de teléfono inválido'}, status=400)

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=to_whatsapp
        )

        return JsonResponse({
            'success': True,
            'message': 'Mensaje enviado correctamente',
            'message_id': message.sid
        })
    except Exception as e:
        logger.error(f"Error en send_whatsapp_confirmation: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_reminder(request):
    try:
        data = json.loads(request.body)
        client_name = data.get('client_name')
        client_phone = data.get('client_phone')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        service_name = data.get('service_name', 'Consulta')

        if not all([client_name, client_phone, appointment_date, appointment_time]):
            return JsonResponse({'success': False, 'error': 'Faltan datos requeridos'}, status=400)

        client = get_twilio_client()

        try:
            date_obj = datetime.strptime(appointment_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d de %B de %Y')
        except ValueError:
            formatted_date = appointment_date

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

        to_whatsapp = format_phone_number(client_phone)
        if not to_whatsapp:
            return JsonResponse({'success': False, 'error': 'Número de teléfono inválido'}, status=400)

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=to_whatsapp
        )

        return JsonResponse({
            'success': True,
            'message': 'Recordatorio enviado por WhatsApp',
            'message_id': message.sid
        })

    except Exception as e:
        logger.error(f"Error en send_whatsapp_reminder: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def whatsapp_webhook(request):
    try:
        from_number = request.POST.get('From', '')
        body = request.POST.get('Body', '')
        logger.info(f"WhatsApp recibido de {from_number}: {body}")
        return JsonResponse({'status': 'received'})
    except Exception as e:
        logger.error(f"Error en webhook: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def test_whatsapp_config(request):
    # lee SIEMPRE el valor *actual*
    sid   = os.getenv('TWILIO_ACCOUNT_SID', '').strip()
    token = os.getenv('TWILIO_AUTH_TOKEN', '').strip()
    whats = os.getenv('TWILIO_WHATSAPP_NUMBER', '').strip()

    config_status = {
        'twilio_available': True,
        'account_sid_configured': bool(sid),
        'auth_token_configured': bool(token),
        'whatsapp_number_configured': bool(whats),
        'connection_test': 'not_attempted'
    }

    if sid and token:
        try:
            client = Client(sid, token)
            account = client.api.accounts(sid).fetch()
            config_status['account_status'] = account.status
            config_status['connection_test'] = 'success'
        except Exception as e:
            config_status['connection_test'] = f'failed: {e}'

    return JsonResponse({'success': True, 'config': config_status})
