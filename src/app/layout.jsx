import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'CoachingPro — Coaching Management System',
  description: 'Manage your coaching institute with classes, batches, teachers, students, attendance, fees, and study materials.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#0a0f1e', color: '#fff', margin: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
