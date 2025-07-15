import { ChangeEvent, useState } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";

const SignupPage = () => {
  const { push } = useRouter();
  const [orignalPassword, setOrignalPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(false);

  const signup = (event: ChangeEvent<any>) => {
    event.preventDefault();

    const email = event.target[0].value;
    const password = event.target[1].value;

    fetch("/api/firebase/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      // const data = await res.json();

      push("/home");
    });
  }

  return (
    <main className="flex w-full justify-center mt-20">
      <div className="flex flex-col gap-6 mt-32 w-96">
        <h3 className="font-semibold text-3xl text-gray-700 text-center mb-4">Sign up</h3>
        <form
          onSubmit={signup}
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
              onChange={(event) => setOrignalPassword(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              onChange={(event) => event.target.value === orignalPassword ? setPasswordMatch(true) : setPasswordMatch(false)}
              className="border border-gray-300 outline-0 bg-transparent grow py-1 px-2 rounded"
            />
          </div>
          <button
            type="submit"
            className={clsx({"!border-gray-400 text-gray-400 hover:!text-gray-400": !passwordMatch}, "py-2 rounded-lg border text-orange-500 border-orange-500 hover:text-orange-600 hover:border-orange-600")}
            disabled={!passwordMatch}
          >
            Sign Up
          </button>
        </form>

      </div>
    </main>
  )
}

export default SignupPage
