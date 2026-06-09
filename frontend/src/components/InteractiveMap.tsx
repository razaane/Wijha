"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
    center: [number, number];
    onMoveEnd: (lat: number, lng: number) => void;
}

// A component that hooks into map events
function MapEvents({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
    useMapEvents({
        moveend: (e) => {
            const center = e.target.getCenter();
            onMoveEnd(center.lat, center.lng);
        },
    });
    return null;
}

export default function InteractiveMap({ center, onMoveEnd }: InteractiveMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="w-full h-full bg-neutral-100 flex items-center justify-center">Loading map...</div>;

    return (
        <MapContainer 
            center={center} 
            zoom={14} 
            scrollWheelZoom={true} 
            className="w-full h-full z-0 relative"
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMoveEnd={onMoveEnd} />
        </MapContainer>
    );
}
