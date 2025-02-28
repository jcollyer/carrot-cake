import { createContext, useLayoutEffect, useState } from "react";
import Layout from "@/app/components/Layout";
import "@/app/globals.css";

export const AuthContext = createContext({
  authenticated: false,
  setAuthenticated: (auth) => {},
});

export default function MyApp({ Component, pageProps }) {
  const [authenticated, setAuthenticated] = useState(false);
  useLayoutEffect(() => {
    fetch("/api/firebase/get-user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      const data = await res.json();
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
