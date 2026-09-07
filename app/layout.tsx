import type { Metadata } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/newsreader';
import './globals.css';
import Offline from '@/components/Offline';
import MotionProvider from '@/components/MotionProvider';
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'Sociopoly · Voices of the next hundred years',
  description:
    'Explore Kampong Glam, Chinatown or Little India. Convene five voices and shape a district across three periods, from 2026 to 2126.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
        <Offline />
      </body>
    </html>
  );
}
