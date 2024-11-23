import { NavBar } from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* Fixed navbar at the top */}
        <div className="fixed top-0 left-0 w-full z-50">
          <NavBar />
        </div>

        {/* Add margin-top to the content to prevent it from being hidden under the navbar */}
        <div className=""> {/* Adjust mt value based on navbar height */}
          {children}
        </div>
      </body>
    </html>
  );
}
