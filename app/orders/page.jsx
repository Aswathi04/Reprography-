// Filename: app/orders/page.jsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { OrderDate } from '@/components/OrderDate';

async function getOrders() {
  try {
    // Get the current user's ID from Clerk
    const { userId } = auth();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Create a Supabase client for the server component
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Fetch orders for the current user
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Print Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No orders found. Ready to print something?</p>
            <a 
              href="/order"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Place New Order
            </a>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {order.file_name}
                        </p>
                        <div className="ml-2 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex flex-col">
                          <p className="flex items-center text-sm text-gray-500">
                            {order.options.quantity}x {order.options.paperSize} • 
                            {order.options.color === 'bw' ? ' Black & White' : ' Color'}
                          </p>
                          <OrderDate dateString={order.created_at} />
                        </div>
                        <p className="text-sm text-gray-500">
                          ${order.total_cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}