"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
    center: [number, number];
    onMoveEnd: (lat: number, lng: number) => void;
    markerPosition?: [number, number];
}

export default function InteractiveMap({ center, onMoveEnd, markerPosition }: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerInstanceRef = useRef<L.Marker | null>(null);
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
                markerInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Handle marker updates
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        if (markerPosition) {
            if (!markerInstanceRef.current) {
                const customIcon = L.divIcon({
                    className: 'custom-map-marker',
                    html: `<div style="background-color: #ff385c; width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display: flex; align-items: center; justify-content: center; color: white;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin fill-current"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>`,
                    iconSize: [48, 48],
                    iconAnchor: [24, 24]
                });
                markerInstanceRef.current = L.marker(markerPosition, { icon: customIcon }).addTo(mapInstanceRef.current);
            } else {
                markerInstanceRef.current.setLatLng(markerPosition);
            }
        } else if (markerInstanceRef.current) {
            markerInstanceRef.current.remove();
            markerInstanceRef.current = null;
        }
    }, [markerPosition]);

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
