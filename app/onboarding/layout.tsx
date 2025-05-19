// app/onboarding/layout.tsx
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // No header/sidebar here—just full-bleed brand blue
  return (
    <html lang="en">
      <body className="overflow-hidden">{children}</body>
    </html>
  )
}
