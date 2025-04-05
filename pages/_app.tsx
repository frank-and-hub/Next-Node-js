import type { AppProps } from "next/app";
import { AuthProvider } from '@/utils/AuthContext';
import { ReRenderProvider } from '@/context/ReRenderContext';
import store from "@/store/store";
import { Provider } from "react-redux";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      </Head>
      <Provider store={store}>
        <AuthProvider>
          <ReRenderProvider>
            <Component {...pageProps} />
          </ReRenderProvider>
        </AuthProvider>
      </Provider>
      
    </>
  );
}
