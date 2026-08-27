import './globals.css';

export const metadata = {
  title: 'Next.js Starter',
  description: 'A clean Next.js App Router starter template.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
