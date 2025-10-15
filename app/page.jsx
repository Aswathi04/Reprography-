// Filename: app/page.jsx

import { auth } from '@clerk/nextjs/server'; // server-only auth helper
import ClientUserButton from '@/components/ClientUserButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const { userId } = auth();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
          Welcome to Reprography
        </h1>
        <p className="text-gray-600 mb-8">
          Your one-stop shop for fast and reliable document printing.
        </p>

        {userId ? (
          // --- CONTENT FOR LOGGED-IN USERS ---
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg text-green-700 font-medium">You are logged in!</p>
            <div className="flex items-center space-x-4">
               <Link href="/order" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                 Place a New Order
               </Link>
               <ClientUserButton afterSignOutUrl="/" />
            </div>
          </div>
        ) : (
          // --- CONTENT FOR LOGGED-OUT USERS ---
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/order" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Order as a Guest
            </Link>
            <Link href="/sign-in" className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}