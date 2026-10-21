import type { Metadata } from 'next';
import './globals.css';
import './use-cases.css';
import './narrative.css';
import './story-clarity.css';
import './office-story.css';
import './case-gallery.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://fielded.ai'),
  alternates: { canonical: 'https://fielded.ai' },
  title: 'Fielded.ai | Your company, in conversation',
  description: 'The digital forward-deployed engineer for organisational understanding. Discover answers, communicate policies and turn adaptive conversations into intelligence and action. Explore internal and advisory use cases.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
