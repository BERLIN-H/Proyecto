import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, MessageCircle, Brain, Heart, Shield, Lock, LogOut, Eye, EyeOff } from 'lucide-react';

// Hook para autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const savedUser = localStorage.getItem('mindcare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // En producción, esto sería una llamada a tu API
      const { identifier, password } = credentials;

      // Admin login
      if (identifier === 'admin@mindcare.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin',
          name: 'Administrador',
          email: 'admin@mindcare.com',
          role: 'admin',
          phone: ''
        };
        setUser(adminUser);
        localStorage.setItem('mindcare_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      // Usuario regular - verificar por email o teléfono
      // En producción, verificarías contra tu base de datos
      const mockUser = {
        id: Date.now().toString(),
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Usuario',
        email: identifier.includes('@') ? identifier : '',
        phone: identifier.includes('@') ? '' : identifier,
        role: 'user'
      };

      setUser(mockUser);
      localStorage.setItem('mindcare_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };

    } catch (error) {
      return { success: false, error: 'Credenciales inválidas' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindcare_user');
  };

  return { user, login, logout, loading };
};

// Componente de Login
const LoginForm = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onLogin({ identifier, password });

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-slate-200/50 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-blue-800 bg-clip-text text-transparent mb-2">
            MindCare
          </h1>
          <p className="text-slate-600">Accede a tu cuenta para ver tus citas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-3">
              📧 Email o WhatsApp
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
              placeholder="tu@email.com o +57 300 123 4567"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-3">
              🔒 Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white pr-12"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              '🔓 Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-blue-700 text-sm font-medium mb-2">Credenciales de prueba:</p>
          <p className="text-blue-600 text-xs">
            👤 <strong>Usuario:</strong> cualquier email o teléfono<br />
            🔑 <strong>Contraseña:</strong> cualquier contraseña<br />
            👨‍💼 <strong>Admin:</strong> admin@mindcare.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook personalizado para manejo de datos dinámicos (modificado con filtros)
const useAppointmentData = (user) => {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Función para cargar servicios desde la API
  const loadServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      setError(err.message);

      // Fallback: datos por defecto para desarrollo
      setServices([
        { id: 1, name: 'Consulta Individual', duration: 60, price: 80000 },
        { id: 2, name: 'Terapia de Pareja', duration: 90, price: 120000 },
        { id: 3, name: 'Terapia Familiar', duration: 90, price: 150000 },
        { id: 4, name: 'Evaluación Psicológica', duration: 120, price: 200000 },
      ]);
    }
  };

  // Función para cargar citas desde la API
  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error cargando citas:', err);
      setError(err.message);

    }
  };

  // Función para crear nueva cita
  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newAppointment = await response.json();
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      console.error('Error creando cita:', err);

      // Fallback: crear localmente para desarrollo
      const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'pending',
        reminder_sent: false
      };
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar cita
  const updateAppointment = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedAppointment = await response.json();
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err) {
      console.error('Error actualizando cita:', err);

      // Fallback: actualizar localmente
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? { ...apt, ...updateData } : apt)
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Función para obtener horarios disponibles
  const getAvailableSlots = async (date, serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/available-slots?date=${date}&serviceId=${serviceId}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error obteniendo horarios:', err);

      // Fallback: generar horarios localmente
      const sampleTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
      const occupiedSlots = appointments
        .filter(apt => apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);

      return sampleTimeSlots.filter(slot => !occupiedSlots.includes(slot));
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadServices(), loadAppointments()]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  return {
    services,
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    getAvailableSlots,
    refreshData: () => Promise.all([loadServices(), loadAppointments()])
  };
};

// Componente principal (modificado)
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

  // Estados del componente
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

  // Rellenar datos del usuario logueado
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

  // Animación de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Cargar horarios disponibles cuando cambia la fecha o servicio
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

  // Manejar envío del formulario
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
      setMessage('¡Cita agendada exitosamente! Recibirás confirmación por WhatsApp.');

      // Limpiar formulario
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

  // Confirmar cita
  const confirmAppointment = async (appointmentId) => {
    try {
      await updateAppointment(appointmentId, {
        status: 'confirmed',
        reminder_sent: true
      });
      setMessage('Cita confirmada exitosamente');
    } catch (error) {
      setMessage('Error al confirmar la cita');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'from-amber-500 to-orange-500 text-white',
      confirmed: 'from-emerald-500 to-green-600 text-white',
      cancelled: 'from-red-500 to-rose-600 text-white',
      completed: 'from-slate-500 to-gray-600 text-white'
    };
    return colors[status] || 'from-gray-400 to-gray-500 text-white';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    return texts[status] || status;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const FloatingShapes = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-teal-100 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-slate-100 to-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );

  // Mostrar loading de autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario de login si no hay usuario
  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  // Mostrar loading de datos
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando sistema de citas...</p>
          {dataError && (
            <p className="text-red-600 text-sm mt-2">Usando datos de prueba: {dataError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingShapes />

      {/* Navbar con usuario logueado */}
      <nav className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-blue-800 bg-clip-text text-transparent">
                MindCare
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 rounded-xl px-4 py-2">
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
              >
                <LogOut className="w-5 h-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
              Bienvenido{user.role === 'admin' ? ', Administrador' : ''}
            </span>
            <br />
            <span className="bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {user.role === 'admin'
              ? 'Panel de administración - Gestiona todas las citas del sistema'
              : 'Gestiona tus citas psicológicas y agenda nuevas consultas'
            }
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-8">
            {[
              { icon: Calendar, label: user.role === 'admin' ? "Total Citas" : "Mis Citas", value: appointments.length },
              { icon: CheckCircle, label: "Confirmadas", value: appointments.filter(apt => apt.status === 'confirmed').length },
              { icon: Clock, label: "Pendientes", value: appointments.filter(apt => apt.status === 'pending').length }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-700">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex justify-center mb-12">
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-2 shadow-lg border border-slate-200/50">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'book'
                ? 'bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              📅 {user.role === 'admin' ? 'Crear Cita' : 'Agendar Cita'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'list'
                ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              📋 {user.role === 'admin' ? 'Todas las Citas' : 'Mis Citas'}
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${message.includes('Error')
            ? 'bg-red-50/80 border-red-200 text-red-700'
            : 'bg-green-50/80 border-green-200 text-green-700'
            }`}>
            <div className="flex items-center">
              {message.includes('Error') ? (
                <XCircle className="w-5 h-5 mr-3" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-3" />
              )}
              {message}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {activeTab === 'book' && (
          <div className="max-w-2xl mx-auto">
            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-slate-200/50 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {user.role === 'admin' ? 'Crear Nueva Cita' : 'Agenda tu Consulta'}
                </h2>
                <p className="text-slate-600">Completa el formulario para reservar tu cita</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Selection */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-4 text-lg">
                    🧠 Tipo de Consulta
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedService == service.id
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="text-slate-800 font-semibold">{service.name}</div>
                        <div className="text-slate-500 text-sm mt-1">{service.duration} min</div>
                        <div className="text-teal-600 font-bold mt-2">${service.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Date Selection */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-4 text-lg">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    Fecha de la Cita
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                    required
                  />
                </div>
                {/* Time Selection */}
                {selectedDate && selectedService && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-4 text-lg">
                      <Clock className="inline w-5 h-5 mr-2" />
                      Horarios Disponibles
                    </label>

                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-xl font-semibold transition-all duration-300 ${selectedTime === time
                              ? 'bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-lg border-2 border-teal-500'
                              : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center mt-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <Clock className="mx-auto w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-slate-500 font-medium">
                          No hay horarios disponibles para esta fecha y servicio
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Selecciona otra fecha o servicio
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Client Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
                    📝 Información del {user.role === 'admin' ? 'Cliente' : 'Paciente'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-3">
                        <User className="inline w-4 h-4 mr-2" />
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={clientData.name}
                        onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-3">
                        <Phone className="inline w-4 h-4 mr-2" />
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={clientData.phone}
                        onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-3">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-3">
                      <MessageCircle className="inline w-4 h-4 mr-2" />
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      value={clientData.notes}
                      onChange={(e) => setClientData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white h-24 resize-none"
                      placeholder="Describe brevemente el motivo de tu consulta o cualquier información relevante..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedDate || !selectedTime || !selectedService}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Agendando cita...
                    </div>
                  ) : (
                    '📅 Confirmar Cita'
                  )}
                </button>
              </form>
              {/* WhatsApp Info Card con Botón */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <div className="flex items-center text-green-700 mb-3">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  <span className="font-bold text-lg">Recordatorios Automáticos</span>
                </div>
                <p className="text-green-600 leading-relaxed mb-4">
                  📲 Recibirás confirmación y recordatorio por WhatsApp
                  <br />
                  💬 Podrás confirmar o reagendar desde WhatsApp
                  <br />
                  🔒 Toda tu información es completamente confidencial
                </p>

                {/* Botón de WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const phoneNumber = "573052274755";

                    // Crear el mensaje con mejor formato
                    const serviceName = services.find(s => s.id == selectedService)?.name || 'No seleccionado';
                    const fecha = selectedDate || 'Por definir';
                    const hora = selectedTime || 'Por definir';
                    const nombre = clientData.name || 'Por completar';

                    const messageLines = [
                      '¡Hola! ',
                      '',
                      'Me gustaría agendar una cita psicológica:',
                      '',
                      `Servicio: ${serviceName}`,
                      `Fecha preferida: ${fecha}`,
                      `Hora preferida: ${hora}`,
                      `Nombre: ${nombre}`,
                      '',
                      'Gracias por su atención.'
                    ];

                    const message = messageLines.join('%0A');
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  💬 Contactar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {activeTab === 'list' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {user.role === 'admin' ? 'Todas las Citas' : 'Mis Citas Programadas'}
              </h2>
              <p className="text-slate-600">
                {appointments.length === 0
                  ? 'No tienes citas programadas'
                  : `Tienes ${appointments.length} cita${appointments.length > 1 ? 's' : ''} programada${appointments.length > 1 ? 's' : ''}`
                }
              </p>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-600 mb-4">No hay citas programadas</h3>
                <p className="text-slate-500 mb-8">¡Agenda tu primera consulta ahora!</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  📅 Agendar Primera Cita
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                      {appointment.reminder_sent && (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Recordatorio enviado</span>
                        </div>
                      )}
                    </div>

                    {/* Appointment Info */}
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-700">
                        <User className="w-5 h-5 mr-3 text-teal-600" />
                        <span className="font-semibold">{appointment.client_name}</span>
                      </div>

                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                        <span>{new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>

                      <div className="flex items-center text-slate-600">
                        <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                        <span>{appointment.time}</span>
                      </div>

                      <div className="flex items-center text-slate-600">
                        <Brain className="w-5 h-5 mr-3 text-purple-600" />
                        <span>{appointment.service_name}</span>
                      </div>

                      {appointment.client_phone && (
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-5 h-5 mr-3 text-green-600" />
                          <span>{appointment.client_phone}</span>
                        </div>
                      )}

                      {appointment.client_email && (
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-5 h-5 mr-3 text-red-600" />
                          <span className="truncate">{appointment.client_email}</span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-start">
                            <MessageCircle className="w-4 h-4 mr-2 text-slate-500 mt-0.5" />
                            <p className="text-sm text-slate-600">{appointment.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {user.role === 'admin' && appointment.status === 'pending' && (
                      <div className="mt-6 flex space-x-3">
                        <button
                          onClick={() => confirmAppointment(appointment.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          ✅ Confirmar
                        </button>
                        <button
                          onClick={() => updateAppointment(appointment.id, { status: 'cancelled' })}
                          className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Button */}
                    {appointment.client_phone && (
                      <div className="mt-4">
                        <a
                          href={`https://wa.me/${appointment.client_phone.replace(/\D/g, '')}?text=Hola! Te escribo desde MindCare para confirmar tu cita del ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES')} a las ${appointment.time}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center"
                        >
                          📱 Contactar por WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-slate-200/50 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              <span className="text-slate-700 font-semibold">Tu bienestar mental es nuestra prioridad</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-slate-600">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-sm">100% Confidencial</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                <span className="text-sm">Datos Seguros</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Profesionales Certificados</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AppointmentSystem;