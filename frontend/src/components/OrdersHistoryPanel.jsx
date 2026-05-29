import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Calendar, IndianRupee, Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../utils/axiosInstanceOld';
import toast from 'react-hot-toast';

const OrderHistoryPanel = ({ userId1, userId2, userType, onBack }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrderHistory();
    }, [page]);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/api/v1/payments/history/${userId1}/${userId2}?page=${page}&limit=10`
            );
            if (response.data?.success) {
                setOrders(response.data.data.orders);
                setTotalPages(response.data.data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching order history:', error);
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return '—';
        }
    };

    const getPaymentStatusBadge = (status) => {
        const config = {
            paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            created: { label: 'Initiated', bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCw },
            failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            refunded: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-700', icon: RefreshCw }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={10} />
                {cfg.label}
            </span>
        );
    };

    const getOrderStatusBadge = (status) => {
        const config = {
            confirmed: { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={10} />
                {cfg.label}
            </span>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h3 className="font-semibold text-gray-900">Order History</h3>
                </div>
                <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-900">Order History</h3>
            </div>

            <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {orders.length === 0 ? (
                    <div className="text-center py-10">
                        <Package size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No orders found</p>
                        <p className="text-sm text-gray-400">You haven't placed any orders with this user yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div
                                    className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex flex-col justify-between items-start"
                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                >
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <p className="text-sm font-mono text-gray-600">{order.orderId}</p>
                                                <span className='text-gray-600 text-xs underline'>(View More)</span>
                                        </div>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {formatDate(order.createdAt)}
                                        </p>
                                        <p className="font-bold text-gray-900 my-2">{formatCurrency(order.amount)}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-2 mt-1">
                                            {getPaymentStatusBadge(order.paymentStatus)}
                                            {getOrderStatusBadge(order.orderStatus)}
                                        </div>
                                    </div>
                                </div>

                                {expandedOrder === order._id && (
                                    <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Service</p>
                                                <p className="font-medium">{order.serviceType}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Plan</p>
                                                <p className="font-medium">{order.period} · {order.duration?.split('·')[0]}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Delivery Status</p>
                                                <p className="font-medium capitalize">{order.deliveryStatus || 'pending'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Payment Date</p>
                                                <p className="font-medium">{order.paymentCompletedAt ? formatDate(order.paymentCompletedAt) : '—'}</p>
                                            </div>
                                        </div>

                                        {order.deliveryDetails?.notes && (
                                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                                                <p className="font-medium mb-1">Delivery Notes:</p>
                                                <p>{order.deliveryDetails.notes}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => window.location.href = `/${userType}/orders/${order._id}`}
                                            className="w-full mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                                        >
                                            View Order Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPanel;