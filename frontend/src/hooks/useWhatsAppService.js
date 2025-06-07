import { useState } from 'react';

export const useWhatsAppService = () => {
  const [sending, setSending] = useState(false);
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const sendConfirmationMessage = async (appointment) => {
    setSending(true);
    try {
      const response = await fetch(`${apiBase}/api/send-whatsapp-confirmation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          client_name: appointment.client_name,
          client_phone: appointment.client_phone,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          service_name: appointment.service_name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al enviar mensaje');
      }

      return result;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return {
    sendConfirmationMessage,
    sending,
  };
};
