import { define } from "../utils.ts";
import OfflineIndicator from "../components/OfflineIndicator.tsx";
import "../assets/styles.css";

export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>QR Attendance System</title>
        <meta
          name="description"
          content="Modern QR-based attendance tracking system for student organizations. Streamline check-ins with digital QR codes and real-time analytics."
        />
        <meta
          name="keywords"
          content="QR attendance, student tracking, event management, check-in system, digital attendance"
        />
        <meta name="author" content="QR Attendance System" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#667eea" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="QR Attendance System" />
        <meta
          property="og:description"
          content="Modern QR-based attendance tracking system for student organizations"
        />
        <meta property="og:image" content="/static/og-image.svg" />
        <meta
          property="og:url"
          content="https://qr-attends.leodyversemilla07.deno.net"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QR Attendance System" />
        <meta
          name="twitter:description"
          content="Modern QR-based attendance tracking system for student organizations"
        />
        <meta name="twitter:image" content="/static/og-image.svg" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "QR Attendance System",
            "description":
              "Modern QR-based attendance tracking system for student organizations",
            "url": "https://qr-attends.leodyversemilla07.deno.net",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "creator": {
              "@type": "Organization",
              "name": "QR Attendance System",
            },
            "featureList": [
              "QR Code Generation",
              "Real-time Attendance Tracking",
              "Analytics Dashboard",
              "Offline Support",
              "CSV Export",
            ],
          })}
        </script>
      </head>
      <body>
        <OfflineIndicator />
        <Component />
      </body>
    </html>
  );
});
