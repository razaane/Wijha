"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, Filter, ShieldCheck, X, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminKycPage() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/kyc');
            if (res.data?.data?.data) {
                setVerifications(res.data.data.data);
            }
        } catch (err) {
            console.error("Failed to load KYC verifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setActionLoading(true);
        try {
            await api.post(`/admin/kyc/${id}/approve`);
            setSelectedKyc(null);
            fetchVerifications();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: number) => {
        if (!rejectReason) {
            alert('Please provide a reason for rejection.');
            return;
        }
        setActionLoading(true);
        try {
            await api.post(`/admin/kyc/${id}/reject`, { reason: rejectReason });
            setSelectedKyc(null);
            setRejectReason('');
            fetchVerifications();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-neutral-900 font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 border-2 border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                        <Filter size={20} />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-xs">
                                <th className="p-4">User</th>
                                <th className="p-4">Document Type</th>
                                <th className="p-4">Submitted At</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.map((kyc) => (
                                <tr key={kyc.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-600">
                                            {kyc.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">{kyc.user?.name}</p>
                                            <p className="text-sm text-neutral-500">{kyc.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full text-sm">
                                            {kyc.document_type === 'id_card' ? 'ID Card' : 'Passport'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-600 font-medium">
                                        {new Date(kyc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {kyc.status === 'pending' && (
                                            <span className="text-amber-600 bg-amber-50 font-bold px-3 py-1 rounded-full text-sm flex items-center w-max gap-1">
                                                <Loader2 size={14} className="animate-spin" /> Pending Review
                                            </span>
                                        )}
                                        {kyc.status === 'approved' && (
                                            <span className="text-green-600 bg-green-50 font-bold px-3 py-1 rounded-full text-sm flex items-center w-max gap-1">
                                                <Check size={14} /> Approved
                                            </span>
                                        )}
                                        {kyc.status === 'rejected' && (
                                            <span className="text-red-600 bg-red-50 font-bold px-3 py-1 rounded-full text-sm flex items-center w-max gap-1">
                                                <XCircle size={14} /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setSelectedKyc(kyc)}
                                            className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {verifications.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium">
                                        No identity verifications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {selectedKyc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-xl flex overflow-hidden"
                        >
                            {/* Document Viewer */}
                            <div className="flex-1 bg-neutral-900 overflow-y-auto p-8 border-r border-neutral-800">
                                <div className="space-y-8 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <h3 className="text-white font-bold text-xl uppercase tracking-wider">Live Selfie</h3>
                                        <div className="bg-neutral-800 rounded-2xl overflow-hidden aspect-[3/4] max-w-sm mx-auto border-4 border-neutral-700">
                                            {selectedKyc.selfie_url ? (
                                                <img src={selectedKyc.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-white font-bold text-xl uppercase tracking-wider">
                                            {selectedKyc.document_type === 'id_card' ? 'ID Card (Front)' : 'Passport'}
                                        </h3>
                                        <div className="bg-neutral-800 rounded-2xl overflow-hidden min-h-64 border-4 border-neutral-700">
                                            {selectedKyc.id_document_front_url ? (
                                                <img src={selectedKyc.id_document_front_url} alt="Front Document" className="w-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedKyc.document_type === 'id_card' && (
                                        <div className="space-y-2">
                                            <h3 className="text-white font-bold text-xl uppercase tracking-wider">ID Card (Back)</h3>
                                            <div className="bg-neutral-800 rounded-2xl overflow-hidden min-h-64 border-4 border-neutral-700">
                                                {selectedKyc.id_document_back_url ? (
                                                    <img src={selectedKyc.id_document_back_url} alt="Back Document" className="w-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info & Actions Sidebar */}
                            <div className="w-96 bg-white flex flex-col">
                                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                    <h3 className="text-xl font-black text-neutral-900">Review Request</h3>
                                    <button onClick={() => setSelectedKyc(null)} className="text-neutral-400 hover:text-neutral-900">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6 flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-xl text-neutral-600">
                                            {selectedKyc.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-neutral-900">{selectedKyc.user?.name}</h4>
                                            <p className="text-neutral-500 font-medium">{selectedKyc.user?.email}</p>
                                            <p className="text-neutral-500 font-medium">{selectedKyc.user?.phone || 'No phone'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                                            <ShieldCheck size={20} />
                                            Identity Verification Check
                                        </div>
                                        <ul className="text-sm text-amber-800 space-y-1 font-medium list-disc pl-4">
                                            <li>Does the selfie match the document photo?</li>
                                            <li>Is the document clear and readable?</li>
                                            <li>Is the document expired?</li>
                                        </ul>
                                    </div>

                                    {selectedKyc.status === 'pending' && (
                                        <div className="space-y-4 pt-4 border-t border-neutral-100">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-neutral-700">Rejection Reason (if rejecting)</label>
                                                <textarea 
                                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-neutral-900 font-medium resize-none"
                                                    placeholder="E.g., Document is blurry..."
                                                    rows={3}
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                />
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => handleReject(selectedKyc.id)}
                                                    disabled={actionLoading}
                                                    className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(selectedKyc.id)}
                                                    disabled={actionLoading}
                                                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                                                >
                                                    Approve Host
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedKyc.status !== 'pending' && (
                                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center font-bold text-neutral-600">
                                            This request was {selectedKyc.status}.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
