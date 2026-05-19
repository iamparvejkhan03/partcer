import { useState, useEffect, createContext, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

// Create context for currency
const CurrencyContext = createContext();

// Custom hook to use currency
export const useCurrency = () => useContext(CurrencyContext);

// Provider component
export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('USD'); // Default to USD for USA students
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Fetch exchange rates when component mounts
    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            setLoading(true);
            // Fetch from your backend endpoint
            const { data } = await axiosInstance('/api/v1/currency/rates');
            setRates(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch rates:', err);
            setError('Could not load exchange rates');
            // Fallback rates (approximate)
            setRates({ USD: 0.0119, INR: 1 });
        } finally {
            setLoading(false);
        }
    };

    // Function to convert price from INR to selected currency
    const convertPrice = (priceInINR) => {
        if (!rates) return priceInINR;

        if (currency === 'INR') {
            return priceInINR;
        } else if (currency === 'USD') {
            return (priceInINR * rates.USD).toFixed(2);
        }
        // Add more currencies here if needed
        return priceInINR;
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        return currency === 'INR' ? '₹' : '$';
    };

    // Toggle between currencies
    const toggleCurrency = () => {
        setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
    };

    // Manually set currency
    const setUserCurrency = (newCurrency) => {
        if (newCurrency === 'USD' || newCurrency === 'INR') {
            setCurrency(newCurrency);
            // Save preference to localStorage
            localStorage.setItem('preferredCurrency', newCurrency);
        }
    };

    // Load saved preference on mount
    useEffect(() => {
        const saved = user?.currencyPreference || localStorage.getItem('preferredCurrency');
        if (saved && (saved === 'USD' || saved === 'INR')) {
            setCurrency(saved);
        }
    }, [user]);
    
    return (
        <CurrencyContext.Provider value={{
            currency,
            rates,
            loading,
            error,
            convertPrice,
            getCurrencySymbol,
            toggleCurrency,
            setUserCurrency
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};