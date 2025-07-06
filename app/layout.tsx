import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import KrigerDanesHeader from '@/components/KrigerDanesHeader'
import KrigerDanesFooter from '@/components/KrigerDanesFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KD Bitcoin Real Estate Calculator',
  description: 'Calculate when Bitcoin holdings could pay off your mortgage refinance',
  keywords: 'bitcoin, real estate, refinance, calculator, mortgage, equity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <KrigerDanesHeader />
          {children}
          <KrigerDanesFooter />
        </div>
      </body>
    </html>
  )
} 