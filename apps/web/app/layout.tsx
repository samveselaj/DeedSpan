import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Profectus — Calm productivity",
  description: "A minimal productivity and accountability platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              className: "!rounded-xl !border-border !bg-surface !text-fg !shadow-soft",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
