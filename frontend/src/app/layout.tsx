import { bacasime, arizonia } from "../../styles/fonts";
import "../../styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bacasime.className} ${arizonia.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
