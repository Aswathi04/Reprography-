// Filename: app/order/page.jsx

// Correct path using an alias
import OrderForm from '@/components/OrderForm';import { UserButton } from '@clerk/nextjs';

export default function OrderPage() {
    return (
        <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                    Place Your Print Order
                </h1>
                {/* This is a pre-built component from Clerk for user profile management */}
                <UserButton afterSignOutUrl="/" />
            </header>
            
            {/* We render the interactive form component here */}
            <OrderForm />
        </main>
    );
}