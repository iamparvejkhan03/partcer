import axiosInstance from "../utils/axiosInstance";

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Create order on backend
export const createOrder = async (orderData) => {
    const response = await axiosInstance.post("/api/v1/payments/create-order", orderData);
    return response.data;
};

// Verify payment
export const verifyPayment = async (paymentData) => {
    const response = await axiosInstance.post("/api/v1/payments/verify", paymentData);
    return response.data;
};

// Get order status
export const getOrderStatus = async (orderId) => {
    const response = await axiosInstance.get(`/api/v1/payments/status/${orderId}`);
    return response.data;
};

// Get user orders
export const getUserOrders = async (userId, page = 1, limit = 10, status = "") => {
    const response = await axiosInstance.get(`/api/v1/payments/user/${userId}`, {
        params: { page, limit, status },
    });
    return response.data;
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = (options) => {
    return new Promise((resolve, reject) => {
        const razorpayOptions = {
            key: options.keyId,
            amount: options.amount,
            currency: options.currency,
            name: "Partcer",
            description: options.description,
            order_id: options.orderId,
            handler: (response) => {
                resolve(response);
            },
            prefill: {
                name: options.prefill?.name || "",
                email: options.prefill?.email || "",
                contact: options.prefill?.contact || "",
            },
            theme: {
                color: options.theme?.color || "#6366f1",
            },
            modal: {
                ondismiss: () => {
                    reject(new Error("Payment cancelled by user"));
                },
            },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
    });
};