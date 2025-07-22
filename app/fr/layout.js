import '../globals.css';  
import Image from 'next/image';
import logo from '/public/logo.png'; // Ensure logo.png exists in /public

export const metadata = {
  title: 'Sovereign Ops Reform App - FR',
};

export default function LocaleLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '20px', 
          borderBottom: '1px solid #ccc',
          backgroundColor: '#001F3F',
          color: 'white'
        }}>
          <Image src={logo} alt="Sovereign Ops Logo" width={40} height={40} />
          <h1 style={{ marginLeft: '15px', fontFamily: 'Arial', fontSize: '1.5rem' }}>
            Sovereign Ops™
          </h1>
        </header>
        <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

