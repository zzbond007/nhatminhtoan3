import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Math Raccoon · Toán nâng cao lớp 3",
  description:
    "Câu lạc bộ toán nâng cao lớp 3 với 36 nhiệm vụ sâu, gợi ý ba tầng, câu chuyển giao và động cơ học thích ứng theo mức tự lực.",
  manifest: `${APP_BASE_PATH}/manifest.webmanifest`,
  applicationName: "Math Raccoon",
  appleWebApp: { capable: true, title: "Math Raccoon", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: `${APP_BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${APP_BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: `${APP_BASE_PATH}/icons/icon-192.png`,
    apple: [{ url: `${APP_BASE_PATH}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5c49d8",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className="child-ui antialiased">{children}</body></html>;
}
