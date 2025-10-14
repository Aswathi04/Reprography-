// Service worker for handling push notifications
self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/vercel.svg', // You can change this to your app's icon
        badge: '/vercel.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'view',
                title: 'View Order'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'view') {
        // Open the orders page when the notification is clicked
        event.waitUntil(
            clients.openWindow('/orders')
        );
    }
});