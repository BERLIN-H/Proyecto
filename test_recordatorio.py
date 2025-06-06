import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_app_citas.Backend.appointments.settings')
django.setup()

from mi_app_citas.Backend.appointments.models import Appointment, Service, Client
from mi_app_citas.Backend.appointments.whatsapp_service import enviar_recordatorio_cita
from datetime import date, time, timedelta

def crear_datos_prueba():
    """Crear datos de prueba"""
    
    # Crear servicio
    service, created = Service.objects.get_or_create(
        name="Consulta Individual",
        defaults={
            'description': 'Consulta psicológica individual',
            'duration': 60,
            'price': 80000
        }
    )
    print(f"✅ Servicio: {service.name}")
    
    
    client, created = Client.objects.get_or_create(
        phone="+573242601994",  
        defaults={
            'name': 'Juan Pérez Test',
            'email': 'juan@test.com'
        }
    )
    print(f"✅ Cliente: {client.name} - {client.phone}")
    
    # Crear cita para mañana
    tomorrow = date.today() + timedelta(days=1)
    appointment, created = Appointment.objects.get_or_create(
        client=client,
        service=service,
        date=tomorrow,
        time=time(10, 0),
        defaults={
            'status': 'confirmed',
            'notes': 'Cita de prueba para recordatorio'
        }
    )
    print(f"✅ Cita: {appointment.date} a las {appointment.time}")
    return appointment

def probar_recordatorio():
    """Probar envío de recordatorio"""
    try:
        print("🔧 Creando datos de prueba...")
        appointment = crear_datos_prueba()
        
        print(f"\n📱 Enviando recordatorio de WhatsApp...")
        print(f"👤 Cliente: {appointment.client.name}")
        print(f"📞 Teléfono: {appointment.client.phone}")
        print(f"📅 Fecha: {appointment.date}")
        print(f"⏰ Hora: {appointment.time}")
        
        # Enviar recordatorio
        result = enviar_recordatorio_cita(appointment)
        
        if result:
            print(f"\n✅ ¡RECORDATORIO ENVIADO EXITOSAMENTE!")
            print(f"📧 SID de WhatsApp: {result.sid}")
            print(f"💬 Revisa tu WhatsApp: {appointment.client.phone}")
        else:
            print("\n❌ Error: No se pudo enviar el recordatorio")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n🔧 Posibles soluciones:")
        print("1. Verificar credenciales de Twilio en .env")
        print("2. Verificar que el número de teléfono sea válido")
        print("3. Verificar conexión a internet")

if __name__ == "__main__":
    print("🚀 Iniciando prueba de recordatorios de WhatsApp...")
    probar_recordatorio()