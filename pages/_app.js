import { createContext } from "react";
import Layout from "@/app/components/Layout";
import { SessionProvider } from "next-auth/react"
import "@/app/globals.css";

export const AuthContext = createContext({
  authenticated: false,
  setAuthenticated: (auth) => {},
});

export default function MyApp({ Component,  pageProps: { session, ...pageProps }, }) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
