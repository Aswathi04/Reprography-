// Filename: app/orders/page.jsx
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { OrderDate } from '@/components/OrderDate';

// Ensure this page is not statically optimized and always evaluates auth/cookies
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getOrders() {
  try {
    const { userId } = auth();
    const cookieStore = await cookies();
    
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('DEBUG - userId:', userId);

    if (userId) {
      // Fetch orders for authenticated users
      console.log('DEBUG - Fetching orders for authenticated user:', userId);
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .is('guest_session_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      console.log('DEBUG - Found orders for user:', orders?.length || 0);
      return orders || [];
    } else {
      // Fetch orders for guests using session ID
      const guestSessionId = cookieStore.get('guest_session_id')?.value;
      console.log('DEBUG - Guest session ID:', guestSessionId);
      
      if (!guestSessionId) {
        console.log('DEBUG - No guest session ID found');
        return [];
      }

      const { data: guestOrders, error: guestError } = await supabase
        .from('orders')
        .select('*')
        .is('user_id', null)
        .eq('guest_session_id', guestSessionId)
        .order('created_at', { ascending: false });

      if (guestError) {
        console.error('Supabase error for guest orders:', guestError);
        return [];
      }

      console.log('DEBUG - Found guest orders:', guestOrders?.length || 0);
      return guestOrders || [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export default async function OrdersPage() {
  const { userId } = auth();
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Print Orders</h1>
            {!userId && (
              <p className="text-sm text-gray-600 mt-2">
                Guest orders • <a href="/sign-in" className="text-indigo-600 hover:text-indigo-700">Sign in</a> to save your orders permanently
              </p>
            )}
          </div>
          <a 
            href="/order"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Place New Order
          </a>
        </div>

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