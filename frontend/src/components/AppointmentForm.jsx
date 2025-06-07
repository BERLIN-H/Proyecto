import React from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageCircle } from 'lucide-react';

const AppointmentForm = ({
  services,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  selectedService,
  setSelectedService,
  availableSlots,
  clientData,
  setClientData,
  handleSubmit,
  loading,
  user,
  getMinDate
}) => {
  return (
    
    <div className="max-w-2xl mx-auto">
      <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-slate-200/50 p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {user.role === 'admin' ? 'Crear Nueva Cita' : 'Agenda tu Consulta'}
          </h2>
          <p className="text-slate-600">Completa el formulario para reservar tu cita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de consulta */}
          <div>
            <label className="block text-slate-700 font-semibold mb-4 text-lg">🧠 Tipo de Consulta</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedService == service.id
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

          {/* Fecha */}
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

          {/* Horarios */}
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
                      className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedTime === time
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
                  <p className="text-slate-500 font-medium">No hay horarios disponibles para esta fecha</p>
                  <p className="text-slate-400 text-sm mt-1">Selecciona otra fecha o servicio</p>
                </div>
              )}
            </div>
          )}

          {/* Datos del cliente */}
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
                  className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 bg-white"
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
                  className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 bg-white"
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
                className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 bg-white"
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
                className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 bg-white h-24 resize-none"
                placeholder="Describe brevemente el motivo de tu consulta..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime || !selectedService}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Agendando cita...' : '📅 Confirmar Cita'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
