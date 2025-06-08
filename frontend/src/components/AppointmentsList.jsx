import React from 'react';
import { CheckCircle, XCircle, Phone } from 'lucide-react';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

const AppointmentsList = ({ appointments, user }) => {
  const { sendConfirmationMessage } = useWhatsAppService();

  const handleConfirm = async (appointment) => {
    try {
      // Actualización local (solo cambia el estado en memoria)
      appointment.status = 'confirmed';
      appointment.reminder_sent = true;

      // Enviar mensaje por WhatsApp
      await sendConfirmationMessage(appointment);

      alert('✅ Cita confirmada y mensaje enviado por WhatsApp');
    } catch (error) {
      alert('❌ Error al enviar mensaje: ' + error.message);
    }
  };

  const handleCancel = async (appointment) => {
    try {
      appointment.status = 'cancelled';
      alert('🚫 Cita cancelada (solo en vista local)');
    } catch (error) {
      alert('❌ Error al cancelar: ' + error.message);
    }
  };

  const handleWhatsApp = (appointment) => {
    const message = encodeURIComponent(
      `Hola ${appointment.client_name}, te recordamos tu cita para el ${appointment.date} a las ${appointment.time} con MindCare.`
    );
    const phone = appointment.client_phone.replace(/\D/g, '');
    const whatsappURL = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  const myAppointments = user.role === 'admin'
    ? appointments
    : appointments.filter(a =>
        a.client_email === user.email || a.client_phone === user.phone
      );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Listado de Citas</h2>

      {myAppointments.length === 0 ? (
        <p className="text-slate-600">No hay citas para mostrar.</p>
      ) : (
        <ul className="space-y-4">
          {myAppointments.map((appointment) => (
            <li key={appointment.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{appointment.service_name}</h3>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {appointment.status === 'confirmed'
                    ? 'Confirmada'
                    : appointment.status === 'cancelled'
                    ? 'Cancelada'
                    : 'Pendiente'}
                </span>
              </div>

              <p className="text-slate-600 text-sm mb-1">
                📅 {appointment.date} 🕒 {appointment.time}
              </p>
              <p className="text-slate-600 text-sm">
                👤 {appointment.client_name} | 📞 {appointment.client_phone}
              </p>

              {user.role === 'admin' && appointment.status !== 'cancelled' && (
                <div className="mt-3 flex space-x-3">
                  {appointment.status !== 'confirmed' && (
                    <button
                      onClick={() => handleConfirm(appointment)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(appointment)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleWhatsApp(appointment)}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentsList;
