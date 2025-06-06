# urls.py  (junto a manage.py)
from django.contrib import admin
from django.urls import path, include
from mi_app_citas.Backend.appointments import views as appointments_views

urlpatterns = [
    # ✔ Raíz “/” – devuelve un JSON simple para verificar que el backend está vivo
    path('', appointments_views.test_whatsapp_config, name='root_check'),

    # ✔ API de tu app
    path('api/', include('mi_app_citas.Backend.appointments.urls')),

    # ✔ Panel de administración
    path('admin/', admin.site.urls),
]
