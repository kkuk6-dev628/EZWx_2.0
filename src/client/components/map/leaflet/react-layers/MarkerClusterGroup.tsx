/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';

import '../plugins/Leaflet.MarkerCluster';

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
  const clusterProps = {};
  const clusterEvents = {};

  // Splitting props and events to different objects
  Object.entries(props).forEach(([propName, prop]) =>
    propName.startsWith('on') ? (clusterEvents[propName] = prop) : (clusterProps[propName] = prop),
  );

  // Creating markerClusterGroup Leaflet element
  // @ts-ignore
  const markerClusterGroup = new L.markerClusterGroup(clusterProps);

  markerClusterGroup.on('clusterclick', (a) => {
    markerClusterGroup._map.fire('click', a);
    L.DomEvent.stopPropagation(a);
  });
  //Remove everything outside the current view (Performance)
  markerClusterGroup._getExpandedVisibleBounds = function () {
    return markerClusterGroup._map.getBounds();
  };
  // Initializing event listeners
  Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
    markerClusterGroup.on(clusterEvent, callback);
  });

  return {
    instance: markerClusterGroup,
    context: { ...ctx, layerContainer: markerClusterGroup },
  };
});

export default MarkerClusterGroup;
