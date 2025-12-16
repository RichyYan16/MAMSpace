import type { Metadata } from 'next'
import './globals.css'
import { AuthContextProvider } from '@/contexts/auth'

export const metadata: Metadata = {
    title: 'MAMS Database',
    description: 'Cool website for MAMS',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>
                <AuthContextProvider>{children}</AuthContextProvider>
            </body>
        </html>
    )
}
