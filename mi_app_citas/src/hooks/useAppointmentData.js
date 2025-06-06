// hooks/useAppointmentData.js
import { useState, useEffect } from 'react';

const useAppointmentData = (user) => {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      setError(err.message);
      setServices([
        { id: 1, name: 'Consulta Individual', duration: 60, price: 80000 },
        { id: 2, name: 'Terapia de Pareja', duration: 90, price: 120000 },
        { id: 3, name: 'Terapia Familiar', duration: 90, price: 150000 },
        { id: 4, name: 'Evaluación Psicológica', duration: 120, price: 200000 }
      ]);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error cargando citas:', err);
      setError(err.message);
    }
  };

  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const newAppointment = await response.json();
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      console.error('Error creando cita:', err);
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

  const updateAppointment = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const updatedAppointment = await response.json();
      setAppointments(prev => prev.map(apt => apt.id === id ? updatedAppointment : apt));
      return updatedAppointment;
    } catch (err) {
      console.error('Error actualizando cita:', err);
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updateData } : apt));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = async (date, serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/available-slots?date=${date}&serviceId=${serviceId}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      console.error('Error obteniendo horarios:', err);
      const sampleTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
      const occupiedSlots = appointments
        .filter(apt => apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);
      return sampleTimeSlots.filter(slot => !occupiedSlots.includes(slot));
    }
  };

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

export default useAppointmentData;
