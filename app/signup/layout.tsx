export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-textPrimary">
      <body className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        {children}
      </body>
    </html>
  )
}
