import {AuthContext} from '@/app/components/Layout'
import { useContext } from "react";

const SigninPage = () => {
  const { setAuthenticated } = useContext(AuthContext);
  
  const login = (event:React.ChangeEvent<any>) => {
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
      window.location.href = '/';
    });
  }
  return (
    <div>
      <center>
        <h1>Log in screen</h1><br /><br />
        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{ color: 'green' }}
          />
          <br /><br></br>
          <input
            type="password"
            placeholder="Enter your password"
            style={{ color: 'green' }}
          />
          <br />
          <button type="submit" className="w-200 p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500">
            Log In
          </button>
        </form>
      </center>
    </div>
  )
}
export default SigninPage
