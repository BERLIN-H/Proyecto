from django.urls import path
from . import views

urlpatterns = [
    # URLs para WhatsApp con Twilio
    path('api/send-whatsapp-confirmation/', views.send_whatsapp_confirmation, name='send_whatsapp_confirmation'),
    path('api/send-whatsapp-reminder/', views.send_whatsapp_reminder, name='send_whatsapp_reminder'),
    path('api/whatsapp-webhook/', views.whatsapp_webhook, name='whatsapp_webhook'),
    path('api/test-whatsapp-config/', views.test_whatsapp_config, name='test_whatsapp_config'),
    
]
