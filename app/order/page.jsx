// Filename: app/order/page.jsx

import OrderForm from '@/components/OrderForm';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

// This page depends on server auth; avoid caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OrderPage() {
    const { userId } = auth();
    
    return (
        <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        Place Your Print Order
                    </h1>
                    {!userId && (
                        <p className="text-sm text-gray-600 mt-2">
                            Ordering as a guest
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {userId ? (
                        <>
                            <Link href="/orders" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                View Orders
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </>
                    ) : (
                        <Link href="/sign-in" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Sign In
                        </Link>
                    )}
                </div>
            </header>
            
            {/* We render the interactive form component here */}
            <OrderForm />
        </main>
    );
}