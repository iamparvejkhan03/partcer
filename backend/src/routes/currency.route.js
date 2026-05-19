import express from 'express';
const currencyRouter = express.Router();

// Simple in-memory cache
let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

async function fetchExchangeRates() {
    // Check if cache is still valid
    if (cachedRates && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        return cachedRates;
    }

    try {
        // Using free API - no API key required
        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();

        cachedRates = {
            USD: data.rates.USD,
            INR: 1, // Base currency
            lastUpdated: new Date().toISOString()
        };
        lastFetchTime = Date.now();

        return cachedRates;
    } catch (error) {
        console.error('Error fetching rates:', error);
        // Return last cached rates if available, otherwise fallback
        if (cachedRates) return cachedRates;
        // Fallback approximate rate (you can adjust)
        return { USD: 0.0119, INR: 1, lastUpdated: new Date().toISOString() };
    }
}

// Endpoint for frontend to get current rates
currencyRouter.get('/rates', async (req, res) => {
    const rates = await fetchExchangeRates();
    res.json(rates);
});

export default currencyRouter;