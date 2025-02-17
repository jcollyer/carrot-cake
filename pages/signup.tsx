const SignupPage = () => {
  const signup = (event:React.ChangeEvent<any>) => {
    event.preventDefault();
    
    const email = event.target[0].value;
    const password = event.target[1].value;
    fetch('/api/firebase/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      const data = await res.json();
      console.log(data);
    });
  }

  return (
    <div>
      <center>
        <h1>Sign Up screen</h1><br /><br />
        <form onSubmit={signup}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{ color: 'green' }} />
          <br /><br></br>
          <input
            type="password"
            placeholder="Enter your password"
            style={{ color: 'green' }} /><br />
          <br />
          <button type="submit"
            className="w-200 p-3 bg-indigo-600 
                     rounded text-white hover:bg-indigo-500">
            Sign Up
          </button>
        </form>
      </center>
    </div>
  )
}

export default SignupPage
