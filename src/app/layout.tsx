import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HRIS - PT Karsa Lintas Nusantara',
  description: 'Aplikasi HRIS Internal PT Karsa Lintas Nusantara',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>{children}</body>
    </html>
  );
}
