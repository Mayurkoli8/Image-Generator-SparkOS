import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "BrandPoster AI",
  description: "Brand-aware real estate poster studio with OpenAI generation and n8n webhook support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}
