// Filename: app/admin/page.jsx

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AdminDashboard from '@/components/AdminDashboard';

// This is a Server Component, so we can securely fetch data directly
async function getOrders() {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    return data;
}

export default async function AdminPage() {
    const { userId } = auth();
    const user = await currentUser();

    // --- 1. ROUTE PROTECTION ---
    // Check for a logged-in user and if they have the 'admin' role
    if (!userId || user?.publicMetadata?.role !== 'admin') {
        redirect('/'); // Redirect non-admins to the homepage
    }
    
    // --- 2. DATA FETCHING ---
    const orders = await getOrders();
    
    // Create public URLs for the file download links
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const ordersWithUrls = orders.map(order => {
        const { data } = supabaseAdmin.storage
            .from('print_files')
            .getPublicUrl(order.file_path);
        return { ...order, publicURL: data.publicUrl };
    });

    return (
        <main className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            {/* --- 3. DISPLAY --- */}
            {/* Pass the fetched data to an interactive client component */}
            <AdminDashboard initialOrders={ordersWithUrls} />
        </main>
    );
}