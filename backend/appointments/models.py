from django.db import models
from django.utils import timezone
from django.urls import reverse
import uuid
import random
import string
from datetime import datetime, timedelta


class Service(models.Model):
    """Modelo para los servicios ofrecidos"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Nombre del servicio")
    description = models.TextField(blank=True, verbose_name="Descripción")
    duration = models.PositiveIntegerField(
        verbose_name="Duración en minutos",
        help_text="Duración del servicio en minutos"
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Precio"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.duration}min - ${self.price}"


class Client(models.Model):
    """Modelo para los clientes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Nombre completo")
    phone = models.CharField(
        max_length=20, 
        unique=True, 
        verbose_name="Teléfono",
        help_text="Número de teléfono con código de país (ej: +57123456789)"
    )
    email = models.EmailField(blank=True, verbose_name="Email")
    
    # Campos para verificación
    verification_token = models.CharField(max_length=6, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone})"

    def generate_verification_token(self):
        """Genera un código de verificación de 6 dígitos"""
        self.verification_token = ''.join(random.choices(string.digits, k=6))
        self.token_expires_at = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.verification_token

    def verify_token(self, token):
        """Verifica si el token es válido y no ha expirado"""
        if not self.verification_token or not self.token_expires_at:
            return False
        
        if timezone.now() > self.token_expires_at:
            return False
        
        if self.verification_token == token:
            # Limpiar el token después de usarlo
            self.verification_token = ''
            self.token_expires_at = None
            self.save()
            return True
        
        return False


class AvailableSlot(models.Model):
    """Modelo para definir horarios disponibles por día de la semana"""
    WEEKDAY_CHOICES = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES,
        verbose_name="Día de la semana"
    )
    start_time = models.TimeField(verbose_name="Hora de inicio")
    end_time = models.TimeField(verbose_name="Hora de fin")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Horario disponible"
        verbose_name_plural = "Horarios disponibles"
        ordering = ['weekday', 'start_time']
        unique_together = ['weekday', 'start_time', 'end_time']

    def __str__(self):
        return f"{self.get_weekday_display()}: {self.start_time} - {self.end_time}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.start_time >= self.end_time:
            raise ValidationError('La hora de inicio debe ser anterior a la hora de fin')


class Appointment(models.Model):
    """Modelo para las citas"""
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no_show', 'No se presentó'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        Client, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        verbose_name="Cliente"
    )
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        verbose_name="Servicio"
    )
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(verbose_name="Hora")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Estado"
    )
    notes = models.TextField(blank=True, verbose_name="Notas")
    
    # Campos para tracking de notificaciones
    confirmation_sent = models.BooleanField(default=False, verbose_name="Confirmación enviada")
    reminder_sent = models.BooleanField(default=False, verbose_name="Recordatorio enviado")
    
    # Token de acceso para que el cliente pueda ver/modificar su cita
    access_token = models.CharField(max_length=32, unique=True, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['-date', '-time']
        unique_together = ['date', 'time']  # Evitar doble booking

    def __str__(self):
        return f"{self.client.name} - {self.service.name} - {self.date} {self.time}"

    def save(self, *args, **kwargs):
        if not self.access_token:
            self.access_token = self.generate_access_token()
        super().save(*args, **kwargs)

    def generate_access_token(self):
        """Genera un token único para acceso a la cita"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    def get_absolute_url(self):
        """URL para que el cliente acceda a su cita"""
        return reverse('appointment_detail', kwargs={
            'appointment_id': self.id
        }) + f'?token={self.access_token}'

    @property
    def datetime(self):
        """Combina fecha y hora en un solo datetime"""
        return datetime.combine(self.date, self.time)

    @property
    def is_past(self):
        """Verifica si la cita ya pasó"""
        return self.datetime < timezone.now()

    @property
    def can_be_cancelled(self):
        """Verifica si la cita puede ser cancelada (al menos 2 horas antes)"""
        if self.status in ['cancelled', 'completed']:
            return False
        return self.datetime > timezone.now() + timedelta(hours=2)

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Validar que la fecha no sea en el pasado
        if self.date < timezone.now().date():
            raise ValidationError('No se pueden crear citas en fechas pasadas')
        
        # Validar que no haya otra cita en el mismo horario
        existing = Appointment.objects.filter(
            date=self.date,
            time=self.time,
            status__in=['pending', 'confirmed']
        ).exclude(pk=self.pk)
        
        if existing.exists():
            raise ValidationError('Ya hay una cita programada para esta fecha y hora')


# Modelo opcional para configuración del sistema
class AppointmentSettings(models.Model):
    """Configuración global del sistema de citas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business_name = models.CharField(max_length=100, default="Mi Negocio")
    business_phone = models.CharField(max_length=20)
    business_email = models.EmailField()
    business_address = models.TextField(blank=True)
    
    # Configuración de horarios
    advance_booking_days = models.PositiveIntegerField(
        default=30,
        help_text="Días máximos de anticipación para agendar citas"
    )
    min_advance_hours = models.PositiveIntegerField(
        default=2,
        help_text="Horas mínimas de anticipación para agendar citas"
    )
    
    # Configuración de recordatorios
    send_confirmation = models.BooleanField(default=True)
    send_reminder = models.BooleanField(default=True)
    reminder_hours_before = models.PositiveIntegerField(
        default=24,
        help_text="Horas antes de la cita para enviar recordatorio"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración"
        verbose_name_plural = "Configuración"

    def __str__(self):
        return f"Configuración - {self.business_name}"

    def save(self, *args, **kwargs):
        # Asegurar que solo haya una instancia de configuración
        if not self.pk and AppointmentSettings.objects.exists():
            raise ValidationError('Solo puede existir una configuración')
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        """Método para obtener la configuración (singleton)"""
        settings, created = cls.objects.get_or_create(
            pk=cls.objects.first().pk if cls.objects.exists() else None,
            defaults={
                'business_name': 'Mi Negocio',
                'business_phone': '+57123456789',
                'business_email': 'contacto@minegocio.com'
            }
        )
        return settings