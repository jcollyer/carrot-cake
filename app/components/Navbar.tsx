import { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/pages/_app';
import clsx from 'clsx';


export default function Navbar() {
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const pathname = usePathname();
  const { push } = useRouter();

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
        push('/');
      }
    });
  }

  return (
    <nav className="fixed h-18 w-full z-10 bg-white border-white drop-shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-8 py-2">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" alt="Carrot Cake Logo" width="100" height="30" className="w-12" />
        </Link>
        <ul className="flex items-center space-x-4">
          {authenticated && (
            <>
              <li>
                <Link href="/upload" className="hover:text-orange-600">Upload</Link>
              </li>
              <li>
                <button onClick={() => signOut()} className="hover:text-orange-600">Log out</button>
              </li>
            </>
          )}
          {!authenticated && (
            <>
              <li>
                <Link href="/signin" className={clsx({ "text-orange-600": pathname === "/signin" }, "hover:text-orange-600")}>Log in</Link>
              </li>
              <li>
                <Link href="/signup" className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 px-4 rounded text-center hover:border border-white">Sign up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )

}