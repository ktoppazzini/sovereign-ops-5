import './globals.css';

export const metadata = {
  title: 'Sovereign Ops',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
