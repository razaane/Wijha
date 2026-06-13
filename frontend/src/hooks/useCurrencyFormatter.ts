import { useAuthStore } from '@/store/auth.store';
import { useCurrencyStore } from '@/store/currency.store';
import { useEffect } from 'react';

export const useCurrencyFormatter = () => {
    const { user } = useAuthStore();
    
    // Default to USD if not set
    const currency = user?.preferred_currency || 'USD';

    const { fetchRates, convert } = useCurrencyStore();

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const formatCurrency = (amount: number, targetCurrency: string = currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const convertPrice = (amount: number, fromCurrency: string, toCurrency: string = currency) => {
        return convert(amount, fromCurrency, toCurrency);
    };

    const formatConverted = (amount: number, fromCurrency: string) => {
        const converted = convert(amount, fromCurrency, currency);
        return formatCurrency(converted, currency);
    };

    return { formatCurrency, formatConverted, convertPrice, currency };
};
