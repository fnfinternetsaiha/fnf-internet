import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FNF Saiha Internet Service - NOC & Customer Portal",
  description: "Saiha High-Speed Fiber Internet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    border: 'hsl(217.2 32.6% 17.5%)',
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
