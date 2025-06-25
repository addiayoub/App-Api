import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import "./App.css"
import ScrollToTop from './components/ScrollToTop';
import Loader from './loader/Loader';
import EmailVerificationModal from './components/Auth/EmailVerificationModal';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import APIExplorer from './components/APIExplorer';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/api-explorer" element={<APIExplorer />} />
        <Route path="/verify-email" element={<EmailVerificationModal />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      </Routes>
      <ScrollToTop />
    </>
  );
};

export default App;