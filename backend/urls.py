from django.contrib import admin
from django.urls import path, include
from appointments.views import ping

urlpatterns = [
    path('', ping, name='ping'),
    path('', include('appointments.urls')),  # Aquí se cargan las rutas del app
    path('admin/', admin.site.urls),
]
