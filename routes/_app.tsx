import { define } from "../utils.ts";
import OfflineIndicator from "../components/OfflineIndicator.tsx";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>QR Attendance System</title>
        <meta
          name="description"
          content="QR-based attendance tracking for student organizations"
        />
        <meta name="theme-color" content="#667eea" />
        <link rel="manifest" href="/manifest.json" />
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
        <script src="/sw-register.js" defer></script>
      </head>
      <body>
        <OfflineIndicator />
        <Component />
      </body>
    </html>
  );
});
