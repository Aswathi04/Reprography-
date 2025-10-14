'use client';

import { useEffect } from 'react';

// VAPID public key - need to be accessible on the client side
const VAPID_PUBLIC_KEY = 'BGbbaOmdeslYIDM08q7yY__q88R0H6eMELcPLArgn7X5VzcyW6n8Q_ugl3-q05ugTQRwj1kzEzwQ7YJDDpCUuJs';

export function NotificationSubscriber() {
    useEffect(() => {
        const setupNotifications = async () => {
            try {
                // Check if service workers are supported
                if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                    console.log('Push notifications are not supported');
                    return;
                }

                // Request notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }

                // Register service worker
                const registration = await navigator.serviceWorker.register('/notification-worker.js');

                // Wait for the service worker to be ready
                await navigator.serviceWorker.ready;

                // Convert VAPID key from base64 to Uint8Array
                if (!VAPID_PUBLIC_KEY) {
                    throw new Error('VAPID public key is not configured');
                }
                const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                // Get push subscription
                let subscription = await registration.pushManager.getSubscription();
                
                if (!subscription) {
                    // Create new subscription if one doesn't exist
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });
                }

                // Send subscription to backend
                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ subscription }),
                });

                console.log('Push notification subscription successful');
            } catch (error) {
                console.error('Error setting up push notifications:', error);
            }
        };

        // Helper function to convert VAPID key
        function urlBase64ToUint8Array(base64String) {
            if (!base64String) return new Uint8Array();
            
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        setupNotifications();
    }, []);

    return null;
}