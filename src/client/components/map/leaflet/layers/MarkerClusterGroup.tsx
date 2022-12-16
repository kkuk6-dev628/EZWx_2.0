import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

require('leaflet.markercluster');

const MarkerClusterGroup = createPathComponent(
  ({ children: _c, ...props }, ctx) => {
    const clusterProps = {};
    const clusterEvents = {};

    // Splitting props and events to different objects
    Object.entries(props).forEach(([propName, prop]) =>
      propName.startsWith('on')
        ? (clusterEvents[propName] = prop)
        : (clusterProps[propName] = prop),
    );

    // Creating markerClusterGroup Leaflet element
    const markerClusterGroup = new L.markerClusterGroup(clusterProps);

    const map = useMap();
    markerClusterGroup.on('clusterclick', (a) => {
      map.fire('click', a);
      L.DomEvent.stopPropagation(a);
    });
    // Initializing event listeners
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
      markerClusterGroup.on(clusterEvent, callback);
    });

    return {
      instance: markerClusterGroup,
      context: { ...ctx, layerContainer: markerClusterGroup },
    };
  },
);

export default MarkerClusterGroup;
