import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Only logout on 401 (unauthorized), not on network errors
      if (error.response?.status === 401) {
        logout();
      } else {
        // For other errors (network, 500, etc), keep the user logged in
        console.warn('Temporary error fetching user, keeping session active');
        setUser({ email: 'Loading...', name: 'Loading...' }); // Placeholder
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      console.log('📧 Email:', email);
      console.log('🌐 API URL:', `${API}/auth/login`);
      console.log('🔑 Backend URL:', process.env.REACT_APP_BACKEND_URL);
      
      const response = await axios.post(`${API}/auth/login`, { email, password });
      console.log('✅ Login successful!', response.data);
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      throw error; // Re-throw so the Login component can handle it
    }
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);