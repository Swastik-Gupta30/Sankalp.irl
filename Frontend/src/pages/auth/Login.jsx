import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Briefcase, BarChart3, AlertCircle } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('user'); // 'user', 'ward_staff', 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const roleConfig = {
        'user': { endpoint: '/auth/user/login', icon: <User className="w-5 h-5"/>, label: "Citizen", route: '/citizen' },
        'ward_staff': { endpoint: '/auth/ward/login', icon: <Briefcase className="w-5 h-5"/>, label: "Ward Staff", route: '/ward-officer' },
        'admin': { endpoint: '/auth/admin/login', icon: <BarChart3 className="w-5 h-5"/>, label: "Admin", route: '/admin' }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = { password };
        if (role === 'user') {
            credentials.email = email;
        } else {
            credentials.gov_email = email;
        }

        const endpoint = roleConfig[role].endpoint;
        const result = await login(endpoint, credentials);

        if (result.success) {
            navigate(roleConfig[role].route);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 -left-48 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-blob"></div>

            <div className="w-full max-w-md space-y-8 z-10 relative">
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                            L
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-black text-white tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Sign in to access your LokaYuktai dashboard
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md px-8 py-10 shadow-2xl rounded-3xl border border-white/10">
                    
                    {/* Role Selector Tabs */}
                    <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl mb-8">
                        {Object.entries(roleConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setRole(key)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-all ${
                                    role === key 
                                    ? 'bg-indigo-500 text-white shadow-md' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                {config.icon}
                                <span className="hidden sm:inline">{config.label}</span>
                            </button>
                        ))}
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-red-200">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300">
                                {role === 'user' ? 'Email Address' : 'Gov Email (.gov.in)'}
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                                placeholder={role === 'user' ? "you@example.com" : "officer@city.gov.in"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-2 text-white bg-slate-950/50 appearance-none relative block w-full px-4 py-3 border border-white/10 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-slate-400">Don't have an account? </span>
                        <Link to="/signup" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Register now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
