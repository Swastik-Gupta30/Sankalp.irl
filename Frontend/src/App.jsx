import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import CitizenPortal from './pages/CitizenPortal';
import WardOfficerDashboard from './pages/WardOfficerDashboard';
import MunicipalAdminDashboard from './pages/MunicipalAdminDashboard';
import PublicFeed from './pages/PublicFeed';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import NewsVerification from './pages/NewsVerification';
import LokSahayak from './pages/LokSahayak';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-14 transition-all duration-400"
      style={{ height: '72px', background: 'linear-gradient(135deg, #0B1D51 0%, #1A3A8F 50%, #0B1D51 100%)', boxShadow: '0 2px 24px rgba(11,29,81,0.55)' }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-4 no-underline">
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(100,149,255,0.4))', boxShadow: '0 0 16px rgba(100,149,255,0.5)' }}>
            <img src="/logo.jpeg" alt="LokAyukt Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', background: 'linear-gradient(to right, #ffffff, #a8c4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LokAyukt</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-6">
        <ul className="flex gap-6 list-none p-0 m-0 items-center">
          <li><Link to="/" className="text-[13px] font-medium tracking-wider text-blue-200 hover:text-white transition-colors uppercase no-underline relative group py-1">Home<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>

          {isAuthenticated && (
            <>
              {user?.role === 'user' && (
                <li><Link to="/citizen" className="text-[13px] font-medium tracking-wider text-blue-200 hover:text-white transition-colors uppercase no-underline relative group py-1">Citizen<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>
              )}
              {user?.role === 'ward_staff' && (
                <li><Link to="/ward-officer" className="text-[13px] font-medium tracking-wider text-blue-200 hover:text-white transition-colors uppercase no-underline relative group py-1">Officer<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>
              )}
              {user?.role === 'admin' && (
                <li><Link to="/admin" className="text-[13px] font-medium tracking-wider text-blue-200 hover:text-white transition-colors uppercase no-underline relative group py-1">Admin<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></Link></li>
              )}
            </>
          )}
        </ul>

        {isAuthenticated ? (
          <button onClick={handleLogout}
            className="text-[12px] font-semibold tracking-wider text-white uppercase px-5 py-2 rounded-full border border-red-400/50 hover:bg-red-500/20 transition-all"
          >Logout</button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-[12px] font-bold text-white uppercase no-underline px-5 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            >Sign In</Link>
            <Link to="/signup"
              className="text-[12px] font-bold text-white uppercase no-underline px-5 py-2 rounded-full transition-all"
              style={{ background: 'linear-gradient(135deg, #0B2A7A 0%, #0D3AA8 100%)', border: '1px solid rgba(100,149,255,0.4)', boxShadow: '0 0 12px rgba(29,78,216,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 20px rgba(29,78,216,0.7)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='0 0 12px rgba(29,78,216,0.4)'}
            >Join Now</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
          <Navigation />

          <main className="flex-1 w-full flex flex-col" style={{ paddingTop: '72px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/public-feed" element={<PublicFeed />} />
              <Route path="/loksahayak" element={<LokSahayak />} />
              <Route path="/news-verification" element={<NewsVerification />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['user', 'ward_staff', 'admin']}>
                  <CitizenPortal />
                </ProtectedRoute>
              } />
              
              <Route path="/ward-officer" element={
                <ProtectedRoute allowedRoles={['ward_staff', 'admin']}>
                  <WardOfficerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MunicipalAdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          <footer className="bg-[#1B1B1F] text-white px-6 md:px-14 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <img src="/logo.jpeg" alt="Logo" className="w-6 h-6 brightness-0 invert opacity-80" />
                <div className="font-serif text-base font-semibold text-white tracking-wide">LokAyukt</div>
              </div>
              <div className="text-[12px] text-white/40 mt-1 tracking-wider uppercase">National Grievance & Accountability Portal · Digital India</div>
            </div>
            <div className="font-serif text-base italic text-[#C8A84B] tracking-widest">सत्यमेव जयते</div>
            <div className="text-[11px] text-white/30 uppercase tracking-widest">© 2026 LokAyukt. All rights reserved.</div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
