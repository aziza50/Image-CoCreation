import { bacasime, arizonia } from "@/styles/fonts";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <script src="https://accounts.google.com/gsi/client" async></script>
      <body
        className={`${bacasime.className} ${arizonia.className} antialiased`}
      >
        <Toaster position="top-center" offset={80} />

        {children}
      </body>
    </html>
  );
}
