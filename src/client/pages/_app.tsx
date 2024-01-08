import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Script from 'next/script';
import Header from '../components/layout/Header';
import '../assets/styles/globals.scss';
import Footer from '../components/layout/Footer';
import { useRouter } from 'next/router';
import { wrapper } from '../store/store';
import { Provider } from 'react-redux';
import Head from 'next/head';

const App = ({ Component, ...rest }: AppProps) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const [showFooter, setShowFooter] = useState(false);
  const { pathname } = useRouter();

  const { pageProps } = props;

  useEffect(() => {
    document.addEventListener('focusout', function (e) {
      const $body = document.querySelector('body');
      $body.style.overflow = 'hidden';
      $body.style.position = 'fixed';
      $body.style.top = `0`;
      $body.style.width = '100%';
    });
  }, []);

  useEffect(() => {
    if (['/map', '/imagery', '/route-profile', '/airportwx', '/dashboard'].includes(pathname)) {
      setShowFooter(false);
    } else {
      setShowFooter(true);
    }
  }, [pathname]);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#3D0D68" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
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
        <title>EZWxBrief 2.0</title>
        <Header />
        <div className="root" style={{ overflowY: showFooter ? 'auto' : 'hidden' }}>
          <Component {...pageProps} />
          {showFooter && <Footer />}
        </div>
      </Provider>
    </>
  );
};

export default App;
