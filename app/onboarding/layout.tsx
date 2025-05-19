export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This replaces the normal header/sidebar for any route under /onboarding
  return (
    <html lang="en">
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  )
}
