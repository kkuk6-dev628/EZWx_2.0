import dynamic from 'next/dynamic';

const RouteProfileDataWrapper = dynamic(() => import('./RouteProfileDataLoader'), {
  ssr: false,
});

export default RouteProfileDataWrapper;
