import os
import django
import time
import schedule
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_app_citas.Backend.appointments.settings')
django.setup()

from mi_app_citas.Backend.appointments.models import Appointment
from mi_app_citas.Backend.appointments.whatsapp_service import enviar_recordatorio_cita

def enviar_recordatorios_diarios():
    """Envía recordatorios para citas de mañana"""
    print(f"🔍 Buscando citas para mañana...")
    tomorrow = date.today() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        date=tomorrow,
        status='confirmed',
        reminder_sent=False
    )
    
    print(f"📅 Encontradas {appointments.count()} citas para mañana")
    
    sent_count = 0
    for appointment in appointments:
        try:
            print(f"📱 Enviando recordatorio a {appointment.client.name}...")
            result = enviar_recordatorio_cita(appointment)
            print(f"✅ Recordatorio enviado: {result.sid}")
            sent_count += 1
        except Exception as e:
            print(f"❌ Error enviando recordatorio: {e}")
    
    print(f"📊 Total enviados: {sent_count} de {appointments.count()}")
    return f"Enviados {sent_count} recordatorios"

def probar_recordatorios_ahora():
    """Ejecutar recordatorios inmediatamente para prueba"""
    print("🚀 Ejecutando recordatorios ahora para prueba...")
    return enviar_recordatorios_diarios()

if __name__ == "__main__":
    # Para pruebas, ejecutar inmediatamente
    probar_recordatorios_ahora()
    
    print("\n⏰ ¿Quieres programar recordatorios automáticos?")
    print("1. Presiona ENTER para programar recordatorios diarios a las 9:00 AM")
    print("2. Presiona Ctrl+C para salir")
    
    try:
        input()
        
        # Programar tarea para ejecutarse todos los días a las 9:00 AM
        schedule.every().day.at("09:00").do(enviar_recordatorios_diarios)
        
        print("⏰ Servicio de recordatorios iniciado")
        print("🔄 Ejecutando recordatorios todos los días a las 9:00 AM")
        print("💡 Presiona Ctrl+C para detener")
        
        # Mantener el script corriendo
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
            
    except KeyboardInterrupt:
        print("\n👋 Servicio de recordatorios detenido")