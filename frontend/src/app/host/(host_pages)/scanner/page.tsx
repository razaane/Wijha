'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2, Calendar } from 'lucide-react';

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Fetch active events for the host
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/listings/me');
                if (res.data?.status === 'success') {
                    const hostEvents = (res.data.data.data || []).filter((l: any) => l.type === 'event' && l.is_active && !l.is_draft);
                    setEvents(hostEvents);
                    if (hostEvents.length > 0) {
                        setSelectedEventId(hostEvents[0].id.toString());
                    }
                }
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setIsLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    // Initialize the scanner when an event is selected
    useEffect(() => {
        if (!selectedEventId) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        scannerRef.current = scanner;

        scanner.render(async (decodedText) => {
            // Pause scanning while processing
            scanner.pause(true);
            setIsScanning(true);
            setError(null);
            setScanResult(null);

            try {
                const data = JSON.parse(decodedText);
                if (!data.booking_id || !data.ticket_code) {
                    throw new Error("Invalid QR Code Format");
                }

                const res = await api.post('/bookings/scan', {
                    booking_id: data.booking_id,
                    ticket_code: data.ticket_code,
                    listing_id: parseInt(selectedEventId)
                });

                if (res.data.status === 'success') {
                    setScanResult(res.data.data);
                }
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to scan ticket.";
                setError(message);
            } finally {
                setIsScanning(false);
                // Resume scanning after 4 seconds to allow reading the status
                setTimeout(() => {
                    if (scannerRef.current) {
                        scannerRef.current.resume();
                    }
                    setError(null);
                    setScanResult(null);
                }, 4000);
            }
        }, (err) => {
            // Ignore scan failures (happens every frame it doesn't find a QR)
        });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [selectedEventId]);

    return (
        <div className="p-6 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                Scan guest QR codes to validate entry.
            </p>

            {/* Event Selection Dropdown */}
            <div className="w-full max-w-md mb-8">
                {isLoadingEvents ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="animate-spin text-amber-500" size={24} />
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 p-4 rounded-xl text-center border border-amber-200 dark:border-amber-500/20">
                        <p className="font-bold">No active events found.</p>
                        <p className="text-sm mt-1">You need an active event to scan tickets.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                            <Calendar size={16} /> Select Event to Scan For
                        </label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                        >
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title || `Event #${event.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {selectedEventId && (
                <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    <div id="reader" className="w-full bg-neutral-100 dark:bg-neutral-950 min-h-[250px]"></div>
                </div>
            )}

            {/* Status Overlay */}
            <div className="mt-8 w-full max-w-md h-32 flex flex-col items-center justify-center">
                {isScanning && (
                    <div className="flex flex-col items-center text-amber-500">
                        <Loader2 className="animate-spin w-8 h-8 mb-2" />
                        <p className="font-semibold">Validating...</p>
                    </div>
                )}

                {scanResult && !isScanning && (
                    <div className="flex flex-col items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl w-full border border-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 mb-2" />
                        <h2 className="text-xl font-bold">{scanResult.guest_name}</h2>
                        <p className="text-sm opacity-80">{scanResult.ticket_type} • #{scanResult.booking_id}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mt-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full">Valid</p>
                    </div>
                )}

                {error && !isScanning && (
                    <div className="flex flex-col items-center bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl w-full border border-red-500/20 text-center">
                        <XCircle className="w-10 h-10 mb-2" />
                        <h2 className="text-lg font-bold">Invalid Ticket</h2>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                )}
                
                {!scanResult && !error && !isScanning && selectedEventId && (
                    <p className="text-neutral-400 font-medium">Ready to scan. Point camera at a QR code.</p>
                )}
            </div>
            
            <style jsx global>{`
                /* Override html5-qrcode styles to make it look modern */
                #reader { border: none !important; }
                #reader__scan_region { background: transparent !important; }
                #reader__dashboard_section_csr button {
                    background: #f59e0b; /* amber-500 */
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 99px;
                    font-weight: 600;
                    margin-top: 10px;
                    cursor: pointer;
                }
                #reader a { color: #f59e0b; text-decoration: none; }
            `}</style>
        </div>
    );
}
