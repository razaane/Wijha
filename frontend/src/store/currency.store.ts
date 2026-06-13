import { create } from 'zustand';

interface CurrencyState {
    rates: Record<string, number> | null;
    base: string;
    lastFetched: number | null;
    isLoading: boolean;
    error: string | null;
    fetchRates: () => Promise<void>;
    convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
    rates: null,
    base: 'USD',
    lastFetched: null,
    isLoading: false,
    error: null,
    
    fetchRates: async () => {
        const { rates, lastFetched, isLoading } = get();
        
        // Don't refetch if currently loading or if we fetched within the last hour (3600000ms)
        if (isLoading || (rates && lastFetched && Date.now() - lastFetched < 3600000)) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            
            if (data && data.rates) {
                set({ 
                    rates: data.rates, 
                    base: data.base_code, 
                    lastFetched: Date.now(),
                    isLoading: false 
                });
            } else {
                throw new Error("Invalid response from exchange API");
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            console.error("Failed to fetch exchange rates:", error);
        }
    },
    
    convert: (amount: number | string, fromCurrency: string, toCurrency: string) => {
        const { rates, base } = get();
        
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (!rates || isNaN(numAmount)) return numAmount || 0;
        if (fromCurrency === toCurrency) return numAmount;
        
        // If fromCurrency is missing from rates, fallback to returning the original amount
        const rateFrom = rates[fromCurrency];
        const rateTo = rates[toCurrency];
        
        if (!rateFrom || !rateTo) return numAmount;
        
        // Convert to base (USD) first, then to target currency
        const amountInBase = numAmount / rateFrom;
        return amountInBase * rateTo;
    }
}));
