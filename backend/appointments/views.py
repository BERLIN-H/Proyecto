from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Appointment, Service

import json
import logging
from datetime import datetime
from twilio.rest import Client
from decouple import config

# Configurar logging
logger = logging.getLogger(__name__)

# Twilio Config desde .env
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = config('TWILIO_WHATSAPP_NUMBER')

# Cliente Twilio
def get_twilio_client():
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        raise ValueError("SID o Auth Token no configurado")
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Formato del número
def format_phone_number(phone):
    if not phone:
        return None
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    if len(clean_phone) == 10:
        clean_phone = '57' + clean_phone
    return f'whatsapp:+{clean_phone}'

# Enviar mensaje de confirmación
@csrf_exempt
@require_http_methods(["POST"])
def send_whatsapp_confirmation(request):
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
        formatted_date = datetime.strptime(appointment_date, '%Y-%m-%d').strftime('%d de %B de %Y')

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

        return JsonResponse({'success': True, 'message_id': message.sid})

    except Exception as e:
        logger.error(f"Error en send_whatsapp_confirmation: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# Enviar mensaje de recordatorio
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
        formatted_date = datetime.strptime(appointment_date, '%Y-%m-%d').strftime('%d de %B de %Y')

        message_body = f"""⏰ *Recordatorio de Cita*

Hola {client_name}, te recordamos que tienes una cita programada.

📅 *Fecha:* {formatted_date}
🕐 *Hora:* {appointment_time}
💼 *Servicio:* {service_name}

📍 *Dirección:* Calle Principal 123, Ciudad

⚠️ *Recuerda:*
• Llegar 15 minutos antes
• Traer documento de identidad

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

        return JsonResponse({'success': True, 'message_id': message.sid})

    except Exception as e:
        logger.error(f"Error en send_whatsapp_reminder: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# Ping para verificar si el backend está operativo
@csrf_exempt
@require_http_methods(["GET"])
def test_backend_alive(request):
    return JsonResponse({'success': True, 'message': 'Backend operativo'})


from django.http import JsonResponse
from django.views.decorators.http import require_GET

@require_GET

def ping(request):
    return JsonResponse({"success": True, "message": "Backend operativo"})


@require_GET
def test_twilio_connection(request):
    try:
        account_sid = config('TWILIO_ACCOUNT_SID')
        auth_token = config('TWILIO_AUTH_TOKEN')
        client = Client(account_sid, auth_token)
        
        # Obtener detalles de la cuenta
        account = client.api.accounts(account_sid).fetch()

        return JsonResponse({
            "success": True,
            "account_sid": account.sid,
            "status": account.status,
            "friendly_name": account.friendly_name
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)
    

@csrf_exempt
@require_http_methods(["PUT"])
def update_appointment(request, appointment_id):
    try:
        data = json.loads(request.body)

        # Aquí puedes hacer la lógica real con DB, por ahora es simulado
        # Si fuera una base de datos deberías consultar y actualizar
        return JsonResponse({
            "id": appointment_id,
            "status": data.get("status", "pending"),
            "reminder_sent": data.get("reminder_sent", False)
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
    
@csrf_exempt
def list_services(request):
    if request.method == 'GET':
        services = list(Service.objects.values())
        return JsonResponse(services, safe=False)

@csrf_exempt
def list_create_appointments(request):
    if request.method == 'GET':
        appointments = list(Appointment.objects.values())
        return JsonResponse(appointments, safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        appointment = Appointment.objects.create(**data)
        return JsonResponse({'id': appointment.id})