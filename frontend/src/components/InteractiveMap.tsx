"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
    center: [number, number];
    onMoveEnd: (lat: number, lng: number) => void;
}

export default function InteractiveMap({ center, onMoveEnd }: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    // Keep a stable ref to the callback so we don't need to re-bind the event listener
    const onMoveEndRef = useRef(onMoveEnd);

    useEffect(() => {
        onMoveEndRef.current = onMoveEnd;
    }, [onMoveEnd]);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map only if it hasn't been initialized yet
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: center,
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            map.on('moveend', () => {
                const c = map.getCenter();
                onMoveEndRef.current(c.lat, c.lng);
            });

            mapInstanceRef.current = map;
        }

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // When the center prop changes externally, update the map view smoothly
    useEffect(() => {
        if (mapInstanceRef.current) {
            const currentCenter = mapInstanceRef.current.getCenter();
            // Only set view if the center has actually changed significantly to avoid feedback loops
            if (Math.abs(currentCenter.lat - center[0]) > 0.0001 || Math.abs(currentCenter.lng - center[1]) > 0.0001) {
                mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom(), { animate: true });
            }
        }
    }, [center]);

    return <div ref={mapRef} className="w-full h-full z-0 relative" />;
}
