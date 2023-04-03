import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Script from 'next/script';
import Header from '../components/layout/Header';
import '../assets/styles/globals.scss';
import Footer from '../components/layout/Footer';
import { useRouter } from 'next/router';
import { wrapper } from '../store/store';
import * as serviceWorkerRegistration from '../app/serviceWorkerRegistration';
import { Provider } from 'react-redux';
import Head from 'next/head';

const App = ({ Component, ...rest }: AppProps) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const [showFooter, setShowFooter] = useState(false);
  const { pathname } = useRouter();

  const { pageProps } = props;

  useEffect(() => {
    // serviceWorkerRegistration.register();
  }, []);

  useEffect(() => {
    if (pathname === '/map' || pathname === '/imagery') {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  }, [pathname]);

  return (
    <Provider store={store}>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
      </Script>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon/favicon-48x48.png" />
        <link rel="mask-icon" href="/icons/favicon/safari-pinned-tab.svg" color="#5bbad5"></link>
        <meta name="theme-color" content="#3D0D68" />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
        />
      </Head>
      <Header />
      <Component {...pageProps} />
      {!showFooter && <Footer />}
    </Provider>
  );
};

export default App;
