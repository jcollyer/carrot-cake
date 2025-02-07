import Navbar from '@/app/components/Navbar';
import Head from 'next/head'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Questrial&display=swap');
        </style>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar />
        <div className="flx-grow">{children}</div>
        <footer className="sticky top-full bg-white border-t-[1px] border-gray-200 text-center text-sm py-4">
          <div>
            <p>© {new Date().getFullYear()} Carrot Cake</p>
          </div>
        </footer>
      </div>
    </div>
  );
}