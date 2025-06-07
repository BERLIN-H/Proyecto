from django.urls import path
from . import views
from .views import test_twilio_connection

urlpatterns = [
    path('send-confirmation/', views.send_whatsapp_confirmation, name='send_confirmation'),
    path('send-reminder/', views.send_whatsapp_reminder, name='send_reminder'),
    path('ping/', views.test_backend_alive, name='ping'),
    path('test-twilio/', test_twilio_connection, name='test_twilio'),
    path('appointments/', views.list_create_appointments, name='list_create_appointments'),
    path('appointments/<str:appointment_id>', views.update_appointment, name='update_appointment'),
    path('services/', views.list_services, name='list_services'),
]
