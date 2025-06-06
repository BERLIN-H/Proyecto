from rest_framework import serializers
from .models import Appointment, Client, Service

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'

class AppointmentCreateSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(write_only=True)
    client_phone = serializers.CharField(write_only=True)
    client_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Appointment
        fields = ['service', 'date', 'time', 'notes', 'client_name', 'client_phone', 'client_email']

    def create(self, validated_data):
        client_data = {
            'name': validated_data.pop('client_name'),
            'phone': validated_data.pop('client_phone'),
            'email': validated_data.pop('client_email', ''),
        }
        
        client, created = Client.objects.get_or_create(
            phone=client_data['phone'],
            defaults=client_data
        )
        
        appointment = Appointment.objects.create(client=client, **validated_data)
        return appointment