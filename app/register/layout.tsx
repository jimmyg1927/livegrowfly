// app/register/layout.tsx
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-black text-white">
        {children}
      </body>
    </html>
  );
}
