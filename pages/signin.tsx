import { useContext } from "react";
import {useRouter} from 'next/router'
import { AuthContext } from '@/app/components/Layout'

const SigninPage = () => {
  const { setAuthenticated } = useContext(AuthContext);
  const { push } = useRouter();

  const login = (event: React.ChangeEvent<any>) => {
    event.preventDefault();

    const email = event.target[0].value;
    const password = event.target[1].value;

    fetch('/api/firebase/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      const user = await res.json();
      console.log(user);
      setAuthenticated(true)
      push('/home');
    });
  }
  return (
    <main className="flex w-full justify-center mt-20">
      <div className="flex flex-col gap-6 mt-32 w-96">
        <h3 className="font-semibold text-3xl text-gray-700 text-center mb-4">Log in</h3>
        <form
          onSubmit={login}
          className="flex flex-col gap-6"
        >
          <div className="flex gap-2">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="border border-gray-300 outline-0 bg-transparent grow py-1 px-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="border border-gray-300 outline-0 bg-transparent grow py-1 px-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="py-2 rounded-lg border text-orange-500 border-orange-500 hover:text-orange-600 hover:border-orange-600"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  )
}
export default SigninPage
