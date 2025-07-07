import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="relative mt-16">{children}</div>
      <Footer />
    </div>
  );
}