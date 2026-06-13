"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Ticket as TicketIcon, Loader2, QrCode, Calendar, MapPin, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

export default function TicketPage() {
    const params = useParams();
    const router = useRouter();
    const { formatConverted } = useCurrencyFormatter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeForm, setDisputeForm] = useState({ reason: '', evidence_text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [disputeError, setDisputeError] = useState<string | null>(null);
    const [disputeSuccess, setDisputeSuccess] = useState(false);

    useEffect(() => {
        // In a real app we'd fetch the specific booking by ID.
        // For this demo, we'll mock the booking data.
        setTimeout(() => {
            setBooking({
                id: params.id,
                total_amount: 150.00,
                currency: 'MAD',
                listing: {
                    type: 'event',
                    title: 'Marrakech Tech Festival',
                    eventMeta: {
                        start_datetime: '2026-06-20T10:00:00Z',
                        end_datetime: '2026-06-22T18:00:00Z',
                        venue_name: 'Palais des Congrès',
                    }
                },
                ticket: {
                    name: 'VIP Access'
                },
                disputes: []
            });
            setLoading(false);
        }, 1000);
    }, [params.id]);

    const handleDispute = async () => {
        if (!disputeForm.reason || disputeForm.evidence_text.length < 10) {
            setDisputeError('Please provide a reason and at least 10 characters of details.');
            return;
        }

        setSubmitting(true);
        setDisputeError(null);

        try {
            await api.post(`/payment/bookings/${params.id}/dispute`, disputeForm);
            setDisputeSuccess(true);
            setDisputeOpen(false);
            setBooking({ ...booking, disputes: [{ status: 'open' }] });
        } catch (err: any) {
            setDisputeError(err.response?.data?.message || 'Failed to submit dispute.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
            </div>
        );
    }

    if (!booking) return null;

    const hasOpenDispute = booking.disputes?.some((d: any) => d.status === 'open');

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200">
                    <div className="bg-amber-500 p-8 text-center text-white relative overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600 rounded-full blur-3xl opacity-50"></div>
                        <div className="relative z-10">
                            <TicketIcon size={48} className="mx-auto mb-4 opacity-90" />
                            <h1 className="text-3xl font-black">{booking.listing.title}</h1>
                            <p className="text-amber-100 font-medium text-lg mt-2">{booking.ticket.name}</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        <div className="flex justify-center">
                            <div className="w-48 h-48 bg-neutral-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300">
                                <QrCode size={120} className="text-neutral-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                    <Calendar size={16} /> <span className="text-sm font-bold uppercase">Date & Time</span>
                                </div>
                                <p className="font-semibold text-neutral-900">
                                    {new Date(booking.listing.eventMeta.start_datetime).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                    <MapPin size={16} /> <span className="text-sm font-bold uppercase">Venue</span>
                                </div>
                                <p className="font-semibold text-neutral-900">
                                    {booking.listing.eventMeta.venue_name}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-dashed border-neutral-200 flex justify-between items-center">
                            <p className="text-sm text-neutral-500 font-bold mb-1">Total Paid</p>
                            <span className="text-2xl font-black text-neutral-900">{formatConverted(booking.total_amount, booking.currency || 'USD')}</span>
                        </div>
                    </div>
                </div>

                {/* Dispute Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900">Having an issue?</h3>
                            <p className="text-neutral-500 mt-1">
                                You can open a dispute up to 48 hours after the event ends. This will freeze the payment to the host until resolved.
                            </p>
                            
                            {hasOpenDispute ? (
                                <div className="mt-4 inline-block px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                                    A dispute is currently open for this booking.
                                </div>
                            ) : disputeSuccess ? (
                                <div className="mt-4 inline-block px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200">
                                    Dispute submitted successfully. We will contact you soon.
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setDisputeOpen(true)}
                                    className="mt-4 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
                                >
                                    Report Issue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dispute Modal */}
            <AnimatePresence>
                {disputeOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                <h3 className="text-xl font-black text-neutral-900">Open Dispute</h3>
                                <button onClick={() => setDisputeOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {disputeError && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium text-sm">
                                        {disputeError}
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700">Reason for Dispute</label>
                                    <select 
                                        className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-neutral-900 font-medium"
                                        value={disputeForm.reason}
                                        onChange={(e) => setDisputeForm({...disputeForm, reason: e.target.value})}
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="event_cancelled">Event was cancelled</option>
                                        <option value="host_no_show">Host did not show up</option>
                                        <option value="not_as_described">Event was not as described</option>
                                        <option value="safety_concern">Safety concerns</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700">Details</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Please provide as much detail as possible..."
                                        className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-neutral-900 font-medium resize-none"
                                        value={disputeForm.evidence_text}
                                        onChange={(e) => setDisputeForm({...disputeForm, evidence_text: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex gap-4">
                                <button 
                                    onClick={() => setDisputeOpen(false)}
                                    className="flex-1 py-3 font-bold text-neutral-600 hover:bg-neutral-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDispute}
                                    disabled={submitting}
                                    className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Dispute'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
