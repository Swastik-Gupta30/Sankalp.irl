import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, DollarSign, Award, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MunicipalAdminDashboard = () => {
    const { user } = useAuth();
    const [flaggedComplaints, setFlaggedComplaints] = useState([]);
    const [loadingFlags, setLoadingFlags] = useState(true);

    // Fetch all complaints for the admin's city, then filter for flagged
    useEffect(() => {
        const fetchFlaggedComplaints = async () => {
            if (!user?.city_id) return;
            try {
                // In a real app we'd have a specific endpoint /complaints/flagged
                // For this MVP, we fetch by city and filter
                const response = await api.get(`/complaints/city/${user.city_id}`);
                console.log("Admin: Fetched complaints:", response.data);
                const flagged = response.data.filter(c => c.status === 'flagged_for_review');
                console.log("Admin: Filtered flagged:", flagged);
                setFlaggedComplaints(flagged);
            } catch (err) {
                console.error("Failed to fetch flagged complaints:", err);
            } finally {
                setLoadingFlags(false);
            }
        };
        fetchFlaggedComplaints();
    }, [user]);

    const handleAdminOverride = async (complaintId, action) => {
        console.log(`Admin override requested: ID=${complaintId}, action=${action}`);
        try {
            const newStatus = action === 'approve' ? 'resolved' : 'rejected';
            console.log(`Sending PATCH request to /complaints/status/${complaintId} with status: ${newStatus}`);
            const res = await api.patch(`/complaints/status/${complaintId}`, { status: newStatus });
            console.log("Status update response:", res.data);
            
            // Remove from queue locally
            setFlaggedComplaints(prev => prev.filter(c => c.id !== complaintId));
        } catch (err) {
            console.error("Failed to override complaint status:", err.response?.data || err.message);
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* Header and KPI summary */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Municipal Decision Intelligence</h1>
                    <p className="text-slate-400 text-sm mt-1">City-wide overview & predictive analytics</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/5 flex items-center">
                        <Activity className="w-8 h-8 text-indigo-400 mr-3 p-1.5 bg-indigo-500/10 rounded-lg" />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">City Trust Index</span>
                            <span className="text-xl font-bold text-white">76%</span>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/5 flex items-center">
                        <AlertTriangle className="w-8 h-8 text-rose-400 mr-3 p-1.5 bg-rose-500/10 rounded-lg" />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Flagged</span>
                            <span className="text-xl font-bold text-rose-400">{flaggedComplaints.length} Pending</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* AI Review Queue (Feature 3 Integration) */}
                <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-rose-500/20 p-5 shadow-lg shadow-rose-500/5">
                    <div className="flex justify-between items-center border-b border-rose-500/20 pb-3 mb-4">
                        <h2 className="text-lg font-semibold text-rose-400 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            AI Flagged Verification Queue
                        </h2>
                        <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-lg">Requires Admin Decision</span>
                    </div>
                    
                    {loadingFlags ? (
                        <div className="text-slate-400 text-center py-8">Loading AI Flags...</div>
                    ) : flaggedComplaints.length === 0 ? (
                        <div className="text-emerald-400 text-center py-8 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                            Excellent! No suspicious Ward Officer uploads detected by AI.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {flaggedComplaints.map(complaint => (
                                <div key={complaint.id} className="bg-slate-950/50 rounded-xl border border-rose-500/30 p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-slate-200 capitalize">Ward {complaint.ward_id} • {complaint.issue_type}</h3>
                                        <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold uppercase border border-rose-500/30">
                                            AI Rejected
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-4">{complaint.text_input}</p>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1 text-center">
                                            <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">Citizen "Before"</p>
                                            <div className="h-24 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                                                {complaint.image_url ? (
                                                    <img 
                                                        src={complaint.image_url.startsWith('http') ? complaint.image_url : `http://localhost:5000${complaint.image_url}`} 
                                                        alt="Before" 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Preview'; }}
                                                    />
                                                ) : <span className="text-xs text-slate-500">No Image</span>}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-xs font-semibold text-rose-400 mb-1 tracking-wider uppercase">Officer "After"</p>
                                            <div className="h-24 bg-slate-800 rounded-lg overflow-hidden border border-rose-500/30 flex items-center justify-center relative">
                                                {complaint.after_image_url ? (
                                                    <img 
                                                        src={complaint.after_image_url.startsWith('http') ? complaint.after_image_url : `http://localhost:5000${complaint.after_image_url}`} 
                                                        alt="After" 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Pending+AI'; }}
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-rose-500 text-center px-1">AI PROCESSING...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Verdict Display for Admin */}
                                    {complaint.ai_feedback && (
                                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 mt-2">
                                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tight mb-1">AI Reasoning Assessment:</p>
                                            <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                                                "{complaint.ai_feedback}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Actions */}
                                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => handleAdminOverride(complaint.id, 'reject')}
                                            className="flex-1 bg-slate-800 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 py-2 rounded-lg text-sm font-semibold border border-rose-500/20 transition flex justify-center items-center"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Reject Proof
                                        </button>
                                        <button 
                                            onClick={() => handleAdminOverride(complaint.id, 'approve')}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 py-2 rounded-lg text-sm font-semibold transition flex justify-center items-center"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Override & Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ward Performance Leaderboard */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
                    <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-amber-400" />
                        Ward Performance Leaderboard
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <div className="flex items-center">
                                <span className="w-8 h-8 flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-300 rounded-full mr-3">1</span>
                                <div>
                                    <p className="font-semibold text-slate-200">Ward 12 (Central)</p>
                                    <p className="text-xs text-slate-500">Speed: 4.2h • Sentiment: 88%</p>
                                </div>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Excellent</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <div className="flex items-center">
                                <span className="w-8 h-8 flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-300 rounded-full mr-3">2</span>
                                <div>
                                    <p className="font-semibold text-slate-200">Ward 5 (North)</p>
                                    <p className="text-xs text-slate-500">Speed: 6.5h • Sentiment: 79%</p>
                                </div>
                            </div>
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold">Good</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <div className="flex items-center">
                                <span className="w-8 h-8 flex items-center justify-center font-bold text-sm bg-slate-800/50 border border-rose-500/20 text-rose-400 rounded-full mr-3">14</span>
                                <div>
                                    <p className="font-semibold text-slate-200">Ward 8 (East)</p>
                                    <p className="text-xs text-slate-500">Speed: 48h • Sentiment: 42%</p>
                                </div>
                            </div>
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">Needs Attention</span>
                        </div>
                    </div>
                </div>

                {/* Welfare Allocation Simulator */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
                    <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-4">Welfare Allocation</h2>
                    <p className="text-sm text-slate-400 mb-6 font-medium">Coming Soon (Feature 2 Integration)</p>
                </div>

            </div>
        </div>
    );
};

export default MunicipalAdminDashboard;
