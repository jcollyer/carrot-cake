import Image from 'next/image'
import { useContext } from 'react';
import { AuthContext } from '@/app/components/Layout';



export default function Navbar() {
  const { authenticated, setAuthenticated } = useContext(AuthContext);

  const signOut = () => {
    fetch('/api/firebase/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      const data = await res.json();
      console.log(data);
      setAuthenticated(false)
      if (data.message === 'Successfully signed out') {
        window.location.href = '/signin';
      }
    });
  }
  console.log('------', authenticated)
  return (
    <nav className="fixed h-18 w-full z-10 bg-white border-white drop-shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-8 py-2">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" alt="Carrot Cake Logo" width="100" height="30" className="w-12" />
        </a>
        <ul className="flex items-center space-x-4">
          <li>
            <a href="/upload" className="hover:text-blue-500">Upload</a>
          </li>
          {authenticated && (
            <li>
              <button onClick={() => signOut()} className="hover:text-blue-500">Sign out</button>
            </li>
          )}
          {!authenticated && (
            <li>
              <a href="/signin" className="hover:text-blue-500">Sign in</a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )

}