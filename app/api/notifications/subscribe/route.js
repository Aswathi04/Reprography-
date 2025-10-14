import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { subscription } = await request.json();
        
        // Log the incoming subscription for debugging
        console.log('Incoming subscription:', subscription);

        // Validate the subscription object
        if (!subscription || typeof subscription !== 'object') {
            return Response.json({ error: 'Invalid subscription object' }, { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Get the session from cookies
        const cookieStore = cookies();
        const supabaseToken = await cookieStore.get('sb-access-token')?.value;
        
        if (!supabaseToken) {
            return Response.json({ error: 'No session found' }, { status: 401 });
        }

        // Get the current user's ID using the session token
        const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);
        
        if (userError || !user) {
            return Response.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Store the push subscription in the database
        const { error: upsertError } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                subscription: JSON.stringify(subscription),
                created_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (upsertError) {
            throw upsertError;
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error storing push subscription:', error);
        return Response.json({ error: 'Failed to store subscription' }, { status: 500 });
    }
}