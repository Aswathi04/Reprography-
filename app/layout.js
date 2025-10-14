// Filename: app/layout.js

// Import the ClerkProvider to manage authentication state for the entire app
import { ClerkProvider } from '@clerk/nextjs'
import { NotificationSubscriber } from '@/components/NotificationSubscriber'
import './globals.css' // This line imports your global styles

// This is standard Next.js metadata for your site (e.g., the title in the browser tab)
export const metadata = {
  title: 'Reprography Print Shop',
  description: 'Upload and print your documents easily.',
}

// This is the Root Layout component that wraps every page
export default function RootLayout({ children }) {
  return (
    // The ClerkProvider is the key addition. It needs to wrap everything else.
    <ClerkProvider>
      <html lang="en">
        <body>
          <NotificationSubscriber />
          {/* {children} is a placeholder for the actual page content being displayed */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}