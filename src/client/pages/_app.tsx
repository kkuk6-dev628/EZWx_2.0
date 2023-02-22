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

const App = ({ Component, ...rest }: AppProps) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const [showFooter, setShowFooter] = useState(false);
  const { pathname } = useRouter();

  const { pageProps } = props;

  useEffect(() => {
    // serviceWorkerRegistration.register();
  }, []);

  useEffect(() => {
    if (pathname === '/try-ezwxbrief' || pathname === '/imagery') {
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
      <Header />
      <Component {...pageProps} />
      {!showFooter && <Footer />}
    </Provider>
  );
};

export default App;
