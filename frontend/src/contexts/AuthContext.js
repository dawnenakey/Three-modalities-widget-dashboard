import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * @typedef {Object} User
 * @property {string} email - User's email address
 * @property {string} name - User's display name
 * @property {number} [id] - User's unique identifier
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User | null} user - Current authenticated user
 * @property {boolean} loading - Whether auth state is being loaded
 * @property {(email: string, password: string) => Promise<User>} login - Login function
 * @property {(name: string, email: string, password: string) => Promise<User>} register - Register function
 * @property {() => void} logout - Logout function
 */

/** @type {React.Context<AuthContextValue | undefined>} */
const AuthContext = createContext(/** @type {AuthContextValue | undefined} */ (undefined));

/** @type {string} */
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Auth Provider component that manages authentication state
 * @param {{ children: React.ReactNode }} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const AuthProvider = ({ children }) => {
  /** @type {[User | null, React.Dispatch<React.SetStateAction<User | null>>]} */
  const [user, setUser] = useState(/** @type {User | null} */ (null));
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [loading, setLoading] = useState(true);
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [token, setToken] = useState(/** @type {string | null} */ (localStorage.getItem('token')));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  /**
   * Fetches the current authenticated user's data
   * @returns {Promise<void>}
   */
  const fetchUser = async () => {
    try {
      /** @type {{ data: User }} */
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (/** @type {any} */ error) {
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

  /**
   * Logs in a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User>} The authenticated user data
   * @throws {Error} If login fails
   */
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      console.log('📧 Email:', email);
      console.log('🌐 API URL:', `${API}/auth/login`);
      console.log('🔑 Backend URL:', process.env.REACT_APP_BACKEND_URL);

      /** @type {{ data: { access_token: string; user: User } }} */
      const response = await axios.post(`${API}/auth/login`, { email, password });
      console.log('✅ Login successful!', response.data);

      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return userData;
    } catch (/** @type {any} */ error) {
      console.error('❌ Login error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      throw error; // Re-throw so the Login component can handle it
    }
  };

  /**
   * Registers a new user
   * @param {string} name - User's display name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User>} The newly registered user data
   */
  const register = async (name, email, password) => {
    /** @type {{ data: { access_token: string; user: User } }} */
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  /**
   * Logs out the current user
   * @returns {void}
   */
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

/**
 * Hook to access authentication context
 * @returns {AuthContextValue} The authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};