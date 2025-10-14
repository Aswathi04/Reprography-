// Filename: components/AdminDashboard.jsx

'use client';

import { useState } from 'react';
import { OrderDate } from './OrderDate';

export default function AdminDashboard({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [loadingStates, setLoadingStates] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');

    const handleStatusChange = async (orderId, newStatus) => {
        setLoadingStates(prev => ({ ...prev, [orderId]: true }));
        
        try {
            const response = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: newStatus,
                    notify: newStatus === 'completed' // Notify user when order is completed
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status. Please try again.');
        } finally {
            setLoadingStates(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            printing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = orders.filter(order => 
        filterStatus === 'all' ? true : order.status === filterStatus
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <div className="flex items-center space-x-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                        Filter by status:
                    </label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="printing">Printing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 mb-1">#{order.id}</span>
                                            <span className="text-sm text-gray-500">{order.file_name}</span>
                                            <span className="text-sm text-gray-500">
                                                {order.options.quantity}x {order.options.paperSize} • 
                                                {order.options.color === 'bw' ? ' Black & White' : ' Color'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <OrderDate dateString={order.created_at} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        ${order.total_cost.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        <a
                                            href={order.publicURL}
                                            className="text-indigo-600 hover:text-indigo-900"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download
                                        </a>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={loadingStates[order.id]}
                                            className="rounded border-gray-300 ml-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="printing">Printing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}