import { useContext, useEffect } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/app/components/Layout';
import { useRouter } from 'next/router';

function LoggedOut() {
  const { authenticated } = useContext(AuthContext);
  const { push } = useRouter();

  useEffect(() => {
    if (authenticated) {
      push('/home');
    }
  }, [authenticated]);

  return (
    <main className="flex w-full justify-center mt-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-7xl mt-32 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Carrot Cake</h1>
        <Link href="/signin" className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 rounded text-center hover:border border-white">
          Sign up
        </Link>
      </div>
    </main>
  );
}

export default LoggedOut;