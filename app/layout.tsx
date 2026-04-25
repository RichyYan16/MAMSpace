import type { Metadata } from 'next'
import './globals.css'
import { AuthContextProvider } from '@/contexts/auth'
import { ThemeProvider } from '@/components/theme-provider'

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
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthContextProvider>{children}</AuthContextProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

