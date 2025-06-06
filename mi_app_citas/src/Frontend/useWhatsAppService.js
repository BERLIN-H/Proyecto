import { useState } from 'react';

export const useWhatsAppService = () => {
  const [sending, setSending] = useState(false);

  const sendConfirmationMessage = async (appointmentData) => {
    setSending(true);
    try {
      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Mensaje enviado' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSending(false);
    }
  };

  const sendReminderMessage = async (appointmentData) => {
    setSending(true);
    try {
      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Recordatorio enviado' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setSending(false);
    }
  };

  return {
    sendConfirmationMessage,
    sendReminderMessage,
    sending,
  };
};