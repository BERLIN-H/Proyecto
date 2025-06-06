
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_app_citas.Backend.appointments.settings')

application = get_wsgi_application()