import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useAppointmentData from '../hooks/useAppointmentData';
import { useWhatsAppService } from '../hooks/useWhatsAppService'; // ✅ correcto

import LoginForm from '../components/LoginForm';
import Navbar from '../components/Navbar';
import FloatingShapes from '../components/FloatingShapes';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentsList from '../components/AppointmentsList';

const AppointmentSystem = () => {
  const { user, login, logout, loading: authLoading } = useAuth();
  const {
    services,
    appointments,
    loading: dataLoading,
    error: dataError,
    createAppointment,
    updateAppointment,
    getAvailableSlots
  } = useAppointmentData(user);

  const {
    sendConfirmationMessage,
    sending
  } = useWhatsAppService();

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('book');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setClientData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedDate && selectedService) {
        try {
          const slots = await getAvailableSlots(selectedDate, selectedService);
          setAvailableSlots(slots);
        } catch (err) {
          console.error('Error cargando horarios:', err);
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
      }
    };

    loadSlots();
  }, [selectedDate, selectedService, appointments]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedService || !clientData.name) {
      setMessage('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const selectedServiceObj = services.find(s => s.id == selectedService);
      const appointmentData = {
        client_name: clientData.name,
        client_phone: clientData.phone,
        client_email: clientData.email,
        date: selectedDate,
        time: selectedTime,
        service_name: selectedServiceObj?.name,
        service_id: selectedServiceObj?.id,
        notes: clientData.notes
      };

      await createAppointment(appointmentData);
      await sendConfirmationMessage(appointmentData);
      setMessage('Cita agendada y mensaje enviado por WhatsApp');

      setSelectedDate('');
      setSelectedTime('');
      setSelectedService('');
      if (user.role === 'admin') {
        setClientData({ name: '', phone: '', email: '', notes: '' });
      }
      setAvailableSlots([]);

    } catch (error) {
      setMessage('Error al agendar la cita: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando autenticación...</div>;
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando sistema de citas...</p>
        {dataError && <p className="text-red-500">Error: {dataError}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingShapes />
      <Navbar user={user} logout={logout} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bienvenido {user.name}</h1>
          <p>{user.role === 'admin' ? 'Panel de administración' : 'Gestiona tus citas psicológicas'}</p>
        </div>

        <div className="flex justify-center mb-8">
          <button onClick={() => setActiveTab('book')} className={`px-6 py-2 rounded-xl mx-2 ${activeTab === 'book' ? 'bg-teal-600 text-white' : 'bg-white'}`}>Agendar Cita</button>
          <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-xl mx-2 ${activeTab === 'list' ? 'bg-teal-600 text-white' : 'bg-white'}`}>Mis Citas</button>
        </div>

        {message && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <div className="flex items-center">
              {message.includes('Error') ? <XCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              {message}
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <AppointmentForm
            services={services}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            availableSlots={availableSlots}
            clientData={clientData}
            setClientData={setClientData}
            handleSubmit={handleSubmit}
            loading={loading || sending}
            user={user}
            getMinDate={getMinDate}
          />
        )}

        {activeTab === 'list' && (
          <AppointmentsList
            appointments={appointments}
            user={user}
            updateAppointment={updateAppointment}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentSystem;
