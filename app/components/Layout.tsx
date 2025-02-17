import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { createContext } from 'react';

export const AuthContext = createContext({
  authenticated: false,
  setAuthenticated: (auth:boolean) => {}
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/firebase/get-user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      const data = await res.json();
      console.log('----layout----', data);
      if (data.user) {
        setAuthenticated(true);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar />
        <div className="flx-grow">{children}</div>
        <footer className="sticky top-full bg-white border-t-[1px] border-gray-200 text-center text-sm py-4">
          <div>
            <p>© {new Date().getFullYear()} Carrot Cake</p>
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}