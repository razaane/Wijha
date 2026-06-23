'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, Home, Building, Tent, Hotel, Wifi, Utensils, Tv, Wind, Car, Waves, Monitor, Snowflake } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROPERTY_TYPES = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building },
    { id: 'guesthouse', label: 'Guesthouse', icon: Tent },
    { id: 'hotel', label: 'Hotel', icon: Hotel },
];

const AMENITIES = [
    { id: 'wifi', label: 'Wifi', icon: Wifi },
    { id: 'kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'air_conditioning', label: 'Air conditioning', icon: Snowflake },
    { id: 'parking', label: 'Free parking', icon: Car },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'workspace', label: 'Dedicated workspace', icon: Monitor },
];

export default function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter State
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [bedrooms, setBedrooms] = useState<number>(0);
    const [beds, setBeds] = useState<number>(0);
    const [bathrooms, setBathrooms] = useState<number>(0);
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    // Initialize state from URL when opened
    useEffect(() => {
        if (isOpen) {
            setMinPrice(searchParams.get('min_price') || '');
            setMaxPrice(searchParams.get('max_price') || '');
            setBedrooms(parseInt(searchParams.get('bedrooms') || '0'));
            setBeds(parseInt(searchParams.get('beds') || '0'));
            setBathrooms(parseInt(searchParams.get('bathrooms') || '0'));
            
            const pt = searchParams.get('property_type');
            if (pt) setSelectedPropertyTypes(pt.split(','));
            else setSelectedPropertyTypes([]);

            const am = searchParams.get('amenities');
            if (am) setSelectedAmenities(am.split(','));
            else setSelectedAmenities([]);
        }
    }, [isOpen, searchParams]);

    if (!isOpen) return null;

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (minPrice) params.set('min_price', minPrice);
        else params.delete('min_price');
        
        if (maxPrice) params.set('max_price', maxPrice);
        else params.delete('max_price');
        
        if (bedrooms > 0) params.set('bedrooms', bedrooms.toString());
        else params.delete('bedrooms');
        
        if (beds > 0) params.set('beds', beds.toString());
        else params.delete('beds');
        
        if (bathrooms > 0) params.set('bathrooms', bathrooms.toString());
        else params.delete('bathrooms');
        
        if (selectedPropertyTypes.length > 0) params.set('property_type', selectedPropertyTypes.join(','));
        else params.delete('property_type');
        
        if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
        else params.delete('amenities');

        onClose();
        router.push(`/browse?${params.toString()}`);
    };

    const handleClearAll = () => {
        setMinPrice('');
        setMaxPrice('');
        setBedrooms(0);
        setBeds(0);
        setBathrooms(0);
        setSelectedPropertyTypes([]);
        setSelectedAmenities([]);
    };

    const toggleArrayItem = (setter: any, array: string[], item: string) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X size={20} className="text-neutral-900 dark:text-white" />
                    </button>
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white">Filters</h2>
                    <div className="w-9"></div> {/* Spacer for centering */}
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
                    
                    {/* Price Range */}
                    <section>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Price range</h3>
                        <p className="text-neutral-500 mb-6">Trip prices before fees and taxes</p>
                        
                        {/* Static Histogram Visual Placeholder */}
                        <div className="flex items-end justify-center gap-1 h-24 mb-4 opacity-50 px-4">
                            {[10, 20, 15, 30, 45, 60, 50, 40, 70, 85, 100, 90, 80, 60, 40, 30, 45, 20, 15, 10, 5].map((h, i) => (
                                <div key={i} className="w-full bg-rose-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex-1 flex flex-col border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                                <label className="text-xs font-bold text-neutral-500">Minimum</label>
                                <div className="flex items-center">
                                    <span className="text-neutral-900 dark:text-white mr-1">$</span>
                                    <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-white" placeholder="20" />
                                </div>
                            </div>
                            <div className="text-neutral-400">-</div>
                            <div className="flex-1 flex flex-col border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                                <label className="text-xs font-bold text-neutral-500">Maximum</label>
                                <div className="flex items-center">
                                    <span className="text-neutral-900 dark:text-white mr-1">$</span>
                                    <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-white" placeholder="300+" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full"></div>

                    {/* Rooms and Beds */}
                    <section>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Rooms and beds</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Bedrooms', val: bedrooms, set: setBedrooms },
                                { label: 'Beds', val: beds, set: setBeds },
                                { label: 'Bathrooms', val: bathrooms, set: setBathrooms }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-neutral-900 dark:text-white text-lg">{item.label}</span>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => item.set(Math.max(0, item.val - 1))}
                                            disabled={item.val === 0}
                                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-black dark:hover:border-white transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-4 text-center font-medium text-neutral-900 dark:text-white">{item.val === 0 ? 'Any' : item.val}</span>
                                        <button 
                                            onClick={() => item.set(item.val + 1)}
                                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 hover:border-black dark:hover:border-white transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full"></div>

                    {/* Property Type */}
                    <section>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Property type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {PROPERTY_TYPES.map(type => {
                                const isSelected = selectedPropertyTypes.includes(type.id);
                                return (
                                    <button 
                                        key={type.id}
                                        onClick={() => toggleArrayItem(setSelectedPropertyTypes, selectedPropertyTypes, type.id)}
                                        className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white bg-transparent'}`}
                                    >
                                        <type.icon size={28} strokeWidth={1.5} className="mb-6 text-neutral-900 dark:text-white" />
                                        <span className="font-semibold text-neutral-900 dark:text-white">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full"></div>

                    {/* Amenities */}
                    <section>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Amenities</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            {AMENITIES.map(amenity => {
                                const isSelected = selectedAmenities.includes(amenity.id);
                                return (
                                    <label 
                                        key={amenity.id} 
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleArrayItem(setSelectedAmenities, selectedAmenities, amenity.id);
                                        }}
                                    >
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-black dark:group-hover:border-white'}`}>
                                            {isSelected && <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '14px', width: '14px', stroke: 'currentColor', strokeWidth: 4, overflow: 'visible' }} className={isSelected ? 'text-white dark:text-black' : 'text-transparent'}><path fill="none" d="m4 16.5 8 8 16-16"></path></svg>}
                                        </div>
                                        <span className="text-neutral-900 dark:text-white text-lg">{amenity.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-[#1a1a1a]">
                    <button 
                        onClick={handleClearAll}
                        className="text-neutral-900 dark:text-white font-bold underline underline-offset-2 hover:text-neutral-500 transition-colors"
                    >
                        Clear all
                    </button>
                    <button 
                        onClick={handleApply}
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3.5 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all"
                    >
                        Show places
                    </button>
                </div>
            </div>
        </div>
    );
}
