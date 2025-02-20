import Link from 'next/link';

function Footer() {
  return (
    <footer className="sticky top-full bg-white border-t-[1px] border-gray-200 text-center text-sm py-4">
      <div className="flex gap-2 justify-center">
        <div className="border-r border-gray-600 pr-2">
          <Link href="/terms-of-service" className="hover:text-orange-600">Terms of Service</Link>
        </div>
        <div className="border-r border-gray-600 pr-2">
          <Link href="/privacy-policy" className="hover:text-orange-600">Privacy Policy</Link>
        </div>
        <div>
          <p>© {new Date().getFullYear()} Carrot Cake</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;