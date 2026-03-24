import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Briefcase, BarChart3, AlertCircle } from 'lucide-react';

const roleConfig = {
    user:      { endpoint: '/auth/user/register',  icon: User,      label: 'Citizen' },
    ward_staff:{ endpoint: '/auth/ward/register',  icon: Briefcase, label: 'Ward Staff' },
    admin:     { endpoint: '/auth/admin/register', icon: BarChart3,  label: 'Admin' },
};

const Signup = () => {
    const [role, setRole]               = useState('user');
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [cityId, setCityId]           = useState(1);
    const [wardId, setWardId]           = useState(1);
    const [civicBodyId, setCivicBodyId] = useState(1);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState('');
    const [loading, setLoading]         = useState(false);

    const { signup } = useAuth();
    const navigate   = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        let data = { password };
        if (role === 'user') {
            data.email = email;
        } else {
            data.gov_email = email;
            data.city_id   = cityId;
            if (role === 'ward_staff') { data.ward_id = wardId; data.civic_body_id = civicBodyId; }
        }
        const result = await signup(roleConfig[role].endpoint, data);
        if (result.success) { setSuccess('Registration successful! Redirecting…'); setTimeout(() => navigate('/login'), 2000); }
        else setError(result.message);
        setLoading(false);
    };

    const inputStyle = { width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:12, fontSize:14, color:'#1F2937', outline:'none', background:'#FAFAFA', boxSizing:'border-box', transition:'border-color 0.2s' };
    const focusIn  = e => e.target.style.borderColor = '#1A3A8F';
    const focusOut = e => e.target.style.borderColor = '#E5E7EB';

    return (
        <div style={{
            flex:1, minHeight:'100vh', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', padding:'48px 16px',
            background:'linear-gradient(170deg, #FAFAF8 0%, #F4F1EC 40%, #FAFAF8 100%)',
            position:'relative', overflow:'hidden',
        }}>
            {/* Background orbs — matches landing page */}
            <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', top:'-20%', right:'-10%', background:'radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', bottom:'-20%', left:'-10%', background:'radial-gradient(circle, rgba(19,136,8,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', top:'30%', left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle, rgba(200,168,75,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

            <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>

                {/* Brand header */}
                <div style={{ textAlign:'center', marginBottom:32 }}>
                    <Link to="/" style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10, textDecoration:'none' }}>
                        <div style={{ width:64, height:64, borderRadius:'50%', padding:3, background:'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(100,149,255,0.4))', boxShadow:'0 0 20px rgba(100,149,255,0.5)' }}>
                            <img src="/logo.jpeg" alt="LokAyukt Logo" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%', display:'block' }} />
                        </div>
                        <span style={{ fontFamily:'Georgia, serif', fontSize:26, fontWeight:700, background:'linear-gradient(to right, #0B1D51, #1A3A8F)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.3px' }}>LokAyukt</span>
                    </Link>
                    <h2 style={{ marginTop:16, color:'#0B1D51', fontSize:28, fontWeight:800, letterSpacing:'-0.02em' }}>Create an Account</h2>
                    <p style={{ marginTop:6, color:'#5a7aaa', fontSize:14 }}>Join LokAyukt to improve your city</p>
                </div>

                {/* Card */}
                <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:24, padding:'36px 36px 30px', boxShadow:'0 24px 64px rgba(11,29,81,0.35), 0 4px 16px rgba(11,29,81,0.15)', border:'1px solid rgba(255,255,255,0.4)' }}>

                    {/* Role tabs */}
                    <div style={{ display:'flex', gap:4, background:'#EEF2F7', borderRadius:14, padding:4, marginBottom:28 }}>
                        {Object.entries(roleConfig).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            const active = role === key;
                            return (
                                <button key={key} onClick={() => setRole(key)} style={{
                                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                                    padding:'8px 4px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                                    transition:'all 0.2s',
                                    background: active ? 'linear-gradient(135deg, #0B1D51, #1A3A8F)' : 'transparent',
                                    color: active ? '#fff' : '#6B7280',
                                    boxShadow: active ? '0 4px 12px rgba(11,29,81,0.3)' : 'none',
                                }}>
                                    <Icon size={15} />
                                    <span>{cfg.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                        {error && (
                            <div style={{ background:'#FEF2F2', border:'1px solid rgba(220,38,38,0.2)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                                <AlertCircle size={16} color="#DC2626" />
                                <span style={{ fontSize:13, color:'#DC2626' }}>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div style={{ background:'#F0FDF4', border:'1px solid rgba(21,128,61,0.2)', borderRadius:10, padding:'10px 14px' }}>
                                <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>{success}</span>
                            </div>
                        )}

                        <div>
                            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#1F2937', marginBottom:6 }}>
                                {role === 'user' ? 'Email Address' : 'Gov Email (.gov.in)'}
                            </label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder={role === 'user' ? 'you@example.com' : 'officer@city.gov.in'}
                                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>

                        <div>
                            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#1F2937', marginBottom:6 }}>Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>

                        {(role === 'admin' || role === 'ward_staff') && (
                            <div>
                                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#1F2937', marginBottom:6 }}>City</label>
                                <select required value={cityId} onChange={e => setCityId(Number(e.target.value))} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                                    <option value={1}>Navi Mumbai (Demo Region)</option>
                                    <option value={2}>Delhi NCR</option>
                                    <option value={3}>Bangalore</option>
                                </select>
                            </div>
                        )}

                        {role === 'ward_staff' && (<>
                            <div>
                                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#1F2937', marginBottom:6 }}>Ward / Zone</label>
                                <select required value={wardId} onChange={e => setWardId(Number(e.target.value))} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                                    {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
                                        <option key={n} value={n}>Ward {n}{n === 1 ? ' (Delhi Test Polygon)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#1F2937', marginBottom:6 }}>Civic Department</label>
                                <select required value={civicBodyId} onChange={e => setCivicBodyId(Number(e.target.value))} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                                    <option value={1}>Public Works Department (PWD)</option>
                                    <option value={2}>Water Works Department</option>
                                    <option value={3}>Sanitation Department</option>
                                    <option value={4}>Electricity Department</option>
                                    <option value={5}>Urban Planning Authority</option>
                                </select>
                            </div>
                        </>)}

                        <button
                            type="submit" disabled={loading}
                            style={{ width:'100%', padding:'14px', border:'none', borderRadius:12, fontSize:14, fontWeight:700, color:'#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop:4, background:'linear-gradient(135deg, #0B1D51 0%, #1A3A8F 100%)', boxShadow:'0 4px 16px rgba(11,29,81,0.35)', transition:'all 0.25s', letterSpacing:'0.04em', textTransform:'uppercase' }}
                            onMouseEnter={e => { if(!loading) e.currentTarget.style.boxShadow='0 8px 24px rgba(11,29,81,0.5)'; }}
                            onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(11,29,81,0.35)'}
                        >
                            {loading ? 'Registering…' : 'Complete Registration'}
                        </button>
                    </form>

                    <div style={{ textAlign:'center', marginTop:20 }}>
                        <span style={{ fontSize:13, color:'#6B7280' }}>Already have an account?</span>{' '}
                        <Link to="/login" style={{ fontSize:13, fontWeight:700, color:'#1A3A8F', textDecoration:'none' }}>Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
