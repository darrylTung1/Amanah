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
    'Convene five voices. Make three decisions. Discover what Kampong Gelam inherits in 2126.',
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
