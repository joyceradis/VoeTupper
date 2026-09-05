import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoeTupper | Sua rede em movimento',
  description: 'Pedidos, metas e pessoas da Rede Serra em um só lugar.',
  applicationName: 'VoeTupper',
  icons: { icon: '/logo-192.png', apple: '/logo-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fff8fb',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
