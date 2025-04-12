import Link from 'next/link';
import Image from 'next/image'
import { MenuProvider, Menu, MenuButton, MenuItem, MenuSeparator } from '@/app/components/primitives/Menu';
import { useSession, signIn, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession();
  const { user } = session || {};
  const { image } = user || {};

  return (
    <nav className="fixed h-18 w-full z-10 bg-white border-white drop-shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-8 py-2">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" alt="Carrot Cake Logo" width="100" height="30" className="w-12" />
        </Link>
        <ul className="flex items-center space-x-4">
          {session && (
            <MenuProvider>
              <MenuButton>
                <img src={image || ""} alt="User Avatar" className="w-10 h-10 rounded-full" />
              </MenuButton>
              <Menu>
                <MenuItem>
                  <Link href="/upload" className="hover:text-orange-600">Upload</Link>
                </MenuItem>
                <MenuSeparator />
                <MenuItem>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:text-orange-600">Log out</button>
                </MenuItem>
              </Menu>
            </MenuProvider>
          )}
          {!session && (
            <>
              <li>
                <button onClick={() => signIn()} className="hover:text-orange-600">Sign in</button>
              </li>
              <li>
                <button onClick={() => signIn()} className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 px-4 rounded text-center hover:border border-white">Sign up</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )

}