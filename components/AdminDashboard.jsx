// Filename: components/AdminDashboard.jsx

'use client';

import { useState } from 'react';

export default function AdminDashboard({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (orderId, newStatus) => {
        // We will build the API for this in the next step
        alert(`Changing order ${orderId} to ${newStatus}. (API logic to be added)`);

        // This is an "optimistic update" - we update the UI immediately
        // without waiting for the backend confirmation.
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="min-w-full text-sm align-middle">
                <thead className="bg-gray-100">
                    <tr className="text-left">
                        <th className="p-3 font-semibold">Order ID</th>
                        <th className="p-3 font-semibold">Created At</th>
                        <th className="p-3 font-semibold">File</th>
                        <th className="p-3 font-semibold">Options</th>
                        <th className="p-3 font-semibold text-right">Cost</th>
                        <th className="p-3 font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{order.id}</td>
                            <td className="p-3 whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</td>
                            <td className="p-3">
                                <a href={order.publicURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                    {order.file_name}
                                </a>
                            </td>
                            <td className="p-3 text-gray-600">
                                {order.options.quantity}x, {order.options.paperSize}, {order.options.color}
                            </td>
                            <td className="p-3 font-medium text-right">${order.total_cost}</td>
                            <td className="p-3">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={loading}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
    );
}