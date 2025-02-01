import Navbar from '@/app/components/Navbar';
import Head from 'next/head'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');
        </style>
        {/* <script src="https://apis.google.com/js/api.js"></script> */}
        <script src="https://apis.google.com/js/client.js?onload=gapiInit"></script>
        {/* <script src="https://apis.google.com/js/client:plusone.js" type="application/javascript"></script> */}
      </Head>
      <Navbar />
      <div className="pt-16">  
        {children}
      </div>
    </div>
  );
}