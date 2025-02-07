import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="fixed h-14 w-full z-10 bg-white border-gray-200 dark:bg-gray-900 drop-shadow">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-8 py-2">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" alt="Carrot Cake Logo" width="100" height="30" className="w-12" />
        </a>
        <ul className="flex items-center space-x-4">
          <li>
            <a href="/upload" className="hover:text-blue-500">Upload</a>
          </li>
          <li>
            <a href="/settings" className="hover:text-blue-500">Settings</a>
          </li>
        </ul>
      </div>
    </nav>
  )

}