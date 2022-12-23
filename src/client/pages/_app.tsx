import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Script from 'next/script';
import Header from '../components/layout/Header';
import '../assets/styles/globals.scss';
import Footer from '../components/layout/Footer';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { store } from '../app/store';

const App = ({ Component, pageProps }: AppProps) => {
  const [showFooter, setShowFooter] = useState(false);
  const { pathname } = useRouter();
  useEffect(() => {
    if (pathname === '/try-ezwxbrief' || pathname === '/imagery') {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  }, [pathname]);
  return (
    <>
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
      <Provider store={store}>
        <Header />
        <Component {...pageProps} />
        {!showFooter && <Footer />}
      </Provider>
    </>
  );
};

export default App;
