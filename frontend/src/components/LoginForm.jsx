// components/LoginForm.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, XCircle, Brain } from 'lucide-react';

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
    if (!result.success) setError(result.error);
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
            <XCircle className="w-5 h-5 mr-2" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-3">📧 Email o WhatsApp</label>
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
            <label className="block text-slate-700 font-semibold mb-3">🔒 Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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

export default LoginForm;
