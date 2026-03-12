import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import CitizenPortal from './pages/CitizenPortal';
import WardOfficerDashboard from './pages/WardOfficerDashboard';
import MunicipalAdminDashboard from './pages/MunicipalAdminDashboard';
import Login from './pages/Login'; 
import Register from './pages/Register';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center justify-between w-full">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">L</div>
              <span className="text-xl font-black tracking-tight text-white">LokaYuktai</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all">Home</Link>
              {token ? (
                <>
                  {role === 'user' && <Link to="/citizen" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all">Citizen Portal</Link>}
                  {role === 'ward' && <Link to="/ward-officer" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all">Ward Officer</Link>}
                  {role === 'admin' && <Link to="/admin" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all">Admin</Link>}
                  <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950 px-3 py-2 rounded-lg text-sm font-medium transition-all ml-4">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all">Sign In</Link>
                  <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <Navigation />
        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/citizen" element={<CitizenPortal />} />
            <Route path="/ward-officer" element={<WardOfficerDashboard />} />
            <Route path="/admin" element={<MunicipalAdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
