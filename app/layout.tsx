import '../styles/globals.css'
import SupabaseProvider from './components/supabase-provider'
import Navigation from './components/navigation'

// レイアウト
const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <SupabaseProvider>
          <div className="flex flex-col min-h-screen bg-[#7494C0]">
            <Navigation />

            <main className="flex-1 container max-w-screen-md mx-auto px-2 py-5 relative">
              {children}
            </main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}

export default RootLayout
