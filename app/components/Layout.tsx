import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export const metadata = {
  title:  "Carrot Cake",
  description: "Youtube Upload & Schedule App",
  verification: {
    google: "google-site-verification=ivuLchF5i_upo7_HQSD4VtFxv0fEcT52mvYsBT7tSLQ",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flx-grow">{children}</div>
      <Footer />
    </div>
  );
}