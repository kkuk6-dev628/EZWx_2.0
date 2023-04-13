import dynamic from 'next/dynamic';

const RouteProfileWrapper = dynamic(() => import('./RouteProfileContainer'), {
  ssr: false,
});

export default RouteProfileWrapper;
