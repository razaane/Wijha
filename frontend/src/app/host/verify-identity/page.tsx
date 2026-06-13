"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UploadCloud, X, Loader2, CheckCircle2, ArrowRight, Camera, FileText, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

type DocType = 'id_card' | 'passport' | null;

export default function VerifyIdentityPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [status, setStatus] = useState<'loading' | 'unverified' | 'pending' | 'approved' | 'rejected'>('loading');
    
    // Multi-step state
    const [step, setStep] = useState<number>(1);
    
    // Form state
    const [docType, setDocType] = useState<DocType>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    
    const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
    const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const idFrontInputRef = useRef<HTMLInputElement>(null);
    const idBackInputRef = useRef<HTMLInputElement>(null);

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/auth/identity-verification');
            if (res.data?.data) {
                setStatus(res.data.data.status);
            } else {
                setStatus('unverified');
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setStatus('unverified');
            } else {
                setStatus('unverified');
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'front') {
                setIdFrontFile(file);
                setIdFrontPreview(URL.createObjectURL(file));
            } else {
                setIdBackFile(file);
                setIdBackPreview(URL.createObjectURL(file));
            }
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
            setError(null);
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please ensure you have granted camera permissions.");
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    }, [stream]);

    useEffect(() => {
        // Cleanup camera on unmount or step change
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setSelfiePreview(dataUrl);
                
                // Convert dataUrl to File object
                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                        setSelfieFile(file);
                    });
                
                stopCamera();
            }
        }
    };

    const retakeSelfie = () => {
        setSelfiePreview(null);
        setSelfieFile(null);
        startCamera();
    };

    const handleSubmit = async () => {
        if (!docType || !idFrontFile || !selfieFile || (docType === 'id_card' && !idBackFile)) {
            setError("Please complete all required steps.");
            return;
        }
        
        setSubmitting(true);
        setError(null);
        
        try {
            const fd = new FormData();
            fd.append('document_type', docType);
            fd.append('id_document_front', idFrontFile);
            if (docType === 'id_card' && idBackFile) {
                fd.append('id_document_back', idBackFile);
            }
            fd.append('selfie', selfieFile);
            
            await api.post('/auth/identity-verification', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setStatus('pending');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit verification.');
        } finally {
            setSubmitting(false);
        }
    };

    const isStep2Valid = () => {
        if (docType === 'passport') return !!idFrontFile;
        return !!idFrontFile && !!idBackFile;
    };

    if (!user) return null;

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
            </div>
        );
    }

    if (status === 'pending' || status === 'approved') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {status === 'approved' ? <CheckCircle2 size={40} /> : <ShieldCheck size={40} />}
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900">
                        {status === 'approved' ? 'Identity Verified' : 'Verification Pending'}
                    </h1>
                    <p className="text-neutral-500 text-lg">
                        {status === 'approved' 
                            ? 'Your identity has been successfully verified. You are clear to host properties and events on Wijha!' 
                            : 'We are currently reviewing your identity documents. This usually takes less than 24 hours. We\'ll notify you once you\'re approved to host!'}
                    </p>
                    {status === 'approved' ? (
                        <a 
                            href="/host/dashboard"
                            className="block w-full text-center py-4 rounded-xl font-bold transition-colors bg-neutral-900 text-white hover:bg-black"
                        >
                            Go to Host Dashboard
                        </a>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            className="block w-full text-center py-4 rounded-xl font-bold transition-colors bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                        >
                            Return to Dashboard
                        </Link>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto w-full">
                <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900 mb-8 inline-block font-bold">
                    ← Back to Traveler Dashboard
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-neutral-200 relative overflow-hidden">
                    
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-100">
                        <div 
                            className="h-full bg-neutral-900 transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">Verify your identity</h1>
                            <p className="text-neutral-500 text-lg mt-1">Step {step} of 3</p>
                        </div>
                    </div>

                    {status === 'rejected' && step === 1 && (
                        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
                            Your previous verification attempt was rejected. Please ensure your documents are clear and match your profile.
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium flex justify-between items-start">
                            <span>{error}</span>
                            <button onClick={() => setError(null)}><X size={16}/></button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Document Type */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="font-bold text-2xl text-neutral-900 mb-4">What type of document do you have?</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setDocType('id_card')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${docType === 'id_card' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <CreditCard size={32} className={`mb-4 ${docType === 'id_card' ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                        <h4 className="font-bold text-lg text-neutral-900">National ID Card</h4>
                                        <p className="text-neutral-500 text-sm mt-1">Requires front and back photos</p>
                                    </button>

                                    <button 
                                        onClick={() => setDocType('passport')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${docType === 'passport' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <FileText size={32} className={`mb-4 ${docType === 'passport' ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                        <h4 className="font-bold text-lg text-neutral-900">Passport</h4>
                                        <p className="text-neutral-500 text-sm mt-1">Requires the photo page</p>
                                    </button>
                                </div>

                                <div className="pt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!docType}
                                        className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-black disabled:opacity-50 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Document Upload */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="font-bold text-2xl text-neutral-900 mb-4">Upload your {docType === 'id_card' ? 'ID Card' : 'Passport'}</h3>
                                
                                <div className={`grid grid-cols-1 ${docType === 'id_card' ? 'sm:grid-cols-2' : ''} gap-6`}>
                                    {/* Front / Passport Data Page */}
                                    <div className="space-y-3">
                                        <p className="font-semibold text-neutral-700">{docType === 'id_card' ? 'Front side' : 'Photo page'}</p>
                                        <div 
                                            onClick={() => !idFrontPreview && idFrontInputRef.current?.click()}
                                            className={`relative h-56 rounded-2xl border-2 ${idFrontPreview ? 'border-neutral-200' : 'border-dashed border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer'} flex flex-col items-center justify-center overflow-hidden transition-all`}
                                        >
                                            {idFrontPreview ? (
                                                <>
                                                    <img src={idFrontPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setIdFrontFile(null); setIdFrontPreview(null); }}
                                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-900 shadow-sm hover:scale-110 transition-transform"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud size={32} className="text-neutral-400 mb-2" />
                                                    <span className="font-bold text-neutral-700 text-sm">Upload Photo</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*,.pdf" className="hidden" ref={idFrontInputRef} onChange={(e) => handleFileUpload(e, 'front')} />
                                    </div>

                                    {/* Back side (ID Card only) */}
                                    {docType === 'id_card' && (
                                        <div className="space-y-3">
                                            <p className="font-semibold text-neutral-700">Back side</p>
                                            <div 
                                                onClick={() => !idBackPreview && idBackInputRef.current?.click()}
                                                className={`relative h-56 rounded-2xl border-2 ${idBackPreview ? 'border-neutral-200' : 'border-dashed border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer'} flex flex-col items-center justify-center overflow-hidden transition-all`}
                                            >
                                                {idBackPreview ? (
                                                    <>
                                                        <img src={idBackPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setIdBackFile(null); setIdBackPreview(null); }}
                                                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-900 shadow-sm hover:scale-110 transition-transform"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud size={32} className="text-neutral-400 mb-2" />
                                                        <span className="font-bold text-neutral-700 text-sm">Upload Photo</span>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" accept="image/*,.pdf" className="hidden" ref={idBackInputRef} onChange={(e) => handleFileUpload(e, 'back')} />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-8 py-4 rounded-xl bg-neutral-100 text-neutral-700 font-bold hover:bg-neutral-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep(3);
                                            startCamera();
                                        }}
                                        disabled={!isStep2Valid()}
                                        className="flex-1 py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-black disabled:opacity-50 transition-colors"
                                    >
                                        Continue to Selfie
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Live Selfie */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="font-bold text-2xl text-neutral-900 mb-2">Take a live selfie</h3>
                                <p className="text-neutral-500 mb-6">Position your face clearly in the frame. This verifies it's really you.</p>
                                
                                <div className="max-w-md mx-auto">
                                    <div className="relative aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden border-4 border-neutral-100 shadow-inner">
                                        
                                        {!selfiePreview && (
                                            <>
                                                <video 
                                                    ref={videoRef} 
                                                    autoPlay 
                                                    playsInline 
                                                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                                                ></video>
                                                
                                                {/* Face overlay guide */}
                                                <div className="absolute inset-0 border-[6px] border-amber-500/30 rounded-[100%] m-8 pointer-events-none"></div>

                                                {!cameraActive && !error && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 text-white z-10">
                                                        <Loader2 className="animate-spin mb-4" size={32} />
                                                        <p className="font-medium">Accessing camera...</p>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                                                    <button 
                                                        onClick={captureSelfie}
                                                        disabled={!cameraActive}
                                                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-neutral-300 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                                                    >
                                                        <Camera size={24} className="text-neutral-900" />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {selfiePreview && (
                                            <div className="relative w-full h-full">
                                                <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-20">
                                                    <button 
                                                        onClick={retakeSelfie}
                                                        className="px-6 py-2 bg-neutral-900/80 backdrop-blur-sm text-white font-bold rounded-full hover:bg-black transition-colors"
                                                    >
                                                        Retake
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hidden canvas for capturing */}
                                        <canvas ref={canvasRef} className="hidden"></canvas>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4 border-t border-neutral-100 mt-8">
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setStep(2);
                                        }}
                                        className="px-8 py-4 rounded-xl bg-neutral-100 text-neutral-700 font-bold hover:bg-neutral-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selfieFile || submitting}
                                        className="flex-1 py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={24} /> : 'Submit Verification'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>
        </div>
    );
}
