// hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mindcare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { identifier, password } = credentials;

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

export default useAuth;
