import { createContext, useEffect, useState } from 'react'
import "@/app/globals.css";
import Layout from "@/app/components/Layout";

export const AuthContext = createContext({
  authenticated: false,
  setAuthenticated: (auth) => {},
});

export default function MyApp({ Component, pageProps }) {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    fetch("/api/firebase/get-user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      const data = await res.json();
      console.log("----layout----", data);
      if (data.user) {
        setAuthenticated(true);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthContext.Provider>
  );
}
