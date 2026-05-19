// Helper to format order price based on stored data
export const formatOrderPrice = (order) => {
    const { studentPaidAmount, studentCurrency, exchangeRateUsed, mentorFee } = order;

    if (studentCurrency === "USD") {
        return {
            amount: studentPaidAmount,
            currency: "USD",
            symbol: "$",
            formatted: `$${studentPaidAmount.toFixed(2)} USD`,
            exchangeRate: exchangeRateUsed,
            inrEquivalent: (studentPaidAmount * exchangeRateUsed).toFixed(2)
        };
    } else {
        return {
            amount: studentPaidAmount,
            currency: "INR",
            symbol: "₹",
            formatted: `₹${studentPaidAmount?.toLocaleString('en-IN')} INR`,
            exchangeRate: null,
            inrEquivalent: studentPaidAmount
        };
    }
};