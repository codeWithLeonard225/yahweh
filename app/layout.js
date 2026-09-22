import "./globals.css";
// app/layout.js

export const metadata = {
  title:
    "Yahweh Academy International – Quality Education & Excellence in Sierra Leone",

  description:
    "Yahweh Academy International provides quality education, academic excellence, discipline, strong moral values, and modern learning opportunities for students in Sierra Leone.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icons/yahweh-academy-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/yahweh-academy-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/icons/yahweh-academy-192x192.png",
    apple: "/icons/yahweh-academy-512x512.png",
  },

  keywords: [
    "Yahweh Academy International",
    "Yahweh Academy Sierra Leone",
    "Yahweh Academy Freetown",
    "Schools in Sierra Leone",
    "Secondary Schools in Sierra Leone",
    "Secondary School Freetown",
    "Quality Education Sierra Leone",
    "WAEC School Sierra Leone",
    "BECE School Sierra Leone",
    "Education in Sierra Leone",
    "School Portal Sierra Leone",
    "Modern Education Sierra Leone",
  ],

  authors: [{ name: "Yahweh Academy International" }],
  creator: "Yahweh Academy International",
  publisher: "Yahweh Academy International",

  // Replace this with the school's actual website domain
  metadataBase: new URL("https://www.yahwehacademy.edu.sl"),

  applicationName: "Yahweh Academy International Portal",
  classification: "Educational Institution",

  robots: {
    index: true,
    follow: true,
  },

  referrer: "strict-origin-when-cross-origin",

  alternates: {
    canonical: "https://www.yahwehacademy.edu.sl",
  },

  openGraph: {
    title:
      "Yahweh Academy International – Excellence in Education",

    description:
      "Yahweh Academy International is committed to quality education, academic excellence, discipline, moral values, and preparing students for a successful future.",

    url: "https://www.yahwehacademy.edu.sl",

    siteName: "Yahweh Academy International",

    type: "website",

    locale: "en_US",

    images: [
      {
        url: "/images/yahweh-academy-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Yahweh Academy International Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Yahweh Academy International – Sierra Leone",

    description:
      "Quality education, academic excellence, discipline, moral values, and modern learning at Yahweh Academy International.",

    images: ["/images/yahweh-academy-logo.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#102A72",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link
        rel="manifest"
        href="/manifest.webmanifest"
      />

      <meta
        name="theme-color"
        content="#102A72"
      />

      <meta
        name="color-scheme"
        content="light"
      />

      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}