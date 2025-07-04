import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashbord/Dashboard';
import Loader from './loader/Loader';
import { toast } from 'react-toastify';
import APIExplorer from './components/APIExplorer';
import EmailVerificationModal from './components/Auth/EmailVerificationModal';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import ScrollToTop from './components/ScrollToTop';
import './App.css';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import axios from 'axios';
import Documentation from './components/Documentation';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            // Vérifier la validité du token avec l'API
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && res.data.success) {
              const userData = res.data.data;
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              throw new Error('Token invalide');
            }
          } catch (apiError) {
            // Si l'API échoue, utiliser les données stockées mais nettoyer si le token est invalide
            console.error('API auth check failed:', apiError);
            if (apiError.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Routes>
        {/* Route principale - affiche Home ou redirige selon le rôle */}
        <Route 
          path="/" 
          element={
            <Home 
              user={user} 
              setUser={setUser}
              onLogout={handleLogout}
            />
          } 
        />
        
        {/* Route pour le dashboard utilisateur normal */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Dashboard 
                  user={user}
                  onLogout={handleLogout}
                />
              )
            ) : (
              <>
                {toast.error('Connexion requise')}
                <Navigate to="/" replace />
              </>
            )
          } 
        />
        
        {/* Route pour l'admin dashboard */}
        <Route 
          path="/admin/*" 
          element={
            user ? (
              user.role === 'admin' ? (
                <AdminDashboard 
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <>
                  {toast.error('Accès administrateur requis')}
                  <Navigate to="/dashboard" replace />
                </>
              )
            ) : (
              <>
                {toast.error('Connexion requise')}
                <Navigate to="/" replace />
              </>
            )
          } 
        />
        
        {/* Routes publiques */}
        <Route path="/api-explorer" element={<APIExplorer />} />
        <Route path="/verify-email" element={<EmailVerificationModal />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
<Route 
  path="/docs" 
  element={
    <Documentation 
      user={user}
      onLogout={handleLogout}
    />
  } 
/>
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ScrollToTop />
    </>
  );
};

export default App;