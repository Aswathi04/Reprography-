import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your contact email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
    try {
        const { orderId, status } = await request.json();
        
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Update the order status
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select('user_id, file_name')
            .single();

        if (updateError) throw updateError;

        // If the order is marked as completed, send a push notification to the user
        if (status === 'completed' && order) {
            try {
                // Get user's push subscription from the database
                const { data: subscriptionData } = await supabase
                    .from('push_subscriptions')
                    .select('subscription')
                    .eq('user_id', order.user_id)
                    .single();

                if (subscriptionData) {
                    const pushSubscription = JSON.parse(subscriptionData.subscription);
                    
                    // Send push notification
                    await webpush.sendNotification(pushSubscription, JSON.stringify({
                        title: 'Your order is ready! 🎉',
                        body: `Your order "${order.file_name}" is now ready for collection. Please visit the reprography office to collect your prints.`
                    }));
                }
            } catch (notificationError) {
                console.error('Failed to send push notification:', notificationError);
                // We don't throw here as the order update was successful
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        return Response.json({ error: 'Failed to update order' }, { status: 500 });
    }
}