// utils/statusHelpers.js

export const getStatusColor = (status) => {
  const colors = {
    pending: 'from-amber-500 to-orange-500 text-white',
    confirmed: 'from-emerald-500 to-green-600 text-white',
    cancelled: 'from-red-500 to-rose-600 text-white',
    completed: 'from-slate-500 to-gray-600 text-white'
  };
  return colors[status] || 'from-gray-400 to-gray-500 text-white';
};

export const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
  };
  return texts[status] || status;
};
