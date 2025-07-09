import Button from "@/app/components/primitives/Button";
import Link from "next/link";
import Image from "next/image"
import { Music2, Youtube } from "lucide-react";
import { MenuProvider, Menu, MenuButton, MenuItem, MenuSeparator } from "@/app/components/primitives/Menu";
import { useSession, signIn, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession();
  const { user } = session || {};

  return (
    <nav className="fixed w-full z-10 bg-white border-white drop-shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-8 py-2">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" alt="Carrot Cake Logo" width="100" height="30" className="w-12" />
        </Link>
        <ul className="flex items-center space-x-4">
          {session && (
            <MenuProvider>
              <MenuButton>
                <img src={user?.image || ""} alt="User Avatar" className="w-10 h-10 rounded-full" />
              </MenuButton>
              <Menu>
                <MenuItem>
                  <Link href="/upload-youtube" className="flex items-center gap-2 hover:text-orange-600">
                    <Youtube size="34" strokeWidth={1} />
                    YouTube Upload
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href="/upload-tiktok" className="flex items-center gap-2 hover:text-orange-600">
                    <Music2 size="18" strokeWidth={2} className="w-9" />
                    TikTok Upload
                  </Link>
                </MenuItem>
                <MenuSeparator />
                <MenuItem className="flex justify-center">
                  <button
                    onClick={() => {
                      // clear previous yt token and userPlaylistId cookies
                      document.cookie =
                        "youtube-tokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie =
                        "userPlaylistId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      signOut({ callbackUrl: "/" })
                    }}
                    className="hover:text-orange-600"
                  >
                    Log out
                  </button>
                </MenuItem>
              </Menu>
            </MenuProvider>
          )}
          {!session && (
            <>
              <li>
                <button
                  onClick={() => signIn()}
                  className="hover:text-orange-600"
                >
                  Sign in
                </button>
              </li>
              <li>
                <Button
                  variant="cta"
                  onClick={() => signIn()}
                >
                  Sign up
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )

}