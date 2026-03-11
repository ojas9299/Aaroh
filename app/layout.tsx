import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrivateChat",
  description: "End-to-end encrypted messaging for two.",
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
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  border: "hsl(217.2 32.6% 17.5%)",
                  input: "hsl(217.2 32.6% 17.5%)",
                  ring: "hsl(212.7 26.8% 83.9%)",
                  background: "hsl(222.2 84% 4.9%)",
                  foreground: "hsl(210 40% 98%)",
                  primary: {
                    DEFAULT: "hsl(217.2 91.2% 59.8%)",
                    foreground: "hsl(222.2 47.4% 11.2%)",
                  },
                  secondary: {
                    DEFAULT: "hsl(217.2 32.6% 17.5%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  destructive: {
                    DEFAULT: "hsl(0 62.8% 30.6%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  muted: {
                    DEFAULT: "hsl(217.2 32.6% 17.5%)",
                    foreground: "hsl(215 20.2% 65.1%)",
                  },
                  accent: {
                    DEFAULT: "hsl(217.2 32.6% 17.5%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  popover: {
                    DEFAULT: "hsl(222.2 84% 4.9%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  card: {
                    DEFAULT: "hsl(222.2 84% 4.9%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                }
              }
            }
          }
        `}} />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen bg-zinc-900 border-border`}>
        {children}
      </body>
    </html>
  );
}
