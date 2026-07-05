import './globals.css';

export const metadata = {
  title: 'Psychiatrist Pro',
  description: 'Clinic Management System',
};

export const viewport = {
  themeColor: 'rgb(79, 70, 229)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-indigo-600">
        {children}
      </body>
    </html>
  );
}