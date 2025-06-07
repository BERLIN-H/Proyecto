import os
from celery import Celery

# Usar la misma ruta que en manage.py

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('sistema_citas')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

from celery.schedules import crontab

app.conf.beat_schedule = {
    'enviar-recordatorios-diarios': {
        'task': 'appointments.tasks.send_daily_reminders',  # También corregir esta ruta
        'schedule': crontab(hour=9, minute=0),
    },
}