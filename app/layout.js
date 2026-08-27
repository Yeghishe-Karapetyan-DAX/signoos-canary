import './globals.css';

export const metadata = {
  title: 'Signoos Next.js Starter',
  description: 'A minimal Next.js starter template for the Signoos repository.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
