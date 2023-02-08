/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import '../plugins/Leaflet.LayerGroup.Collision';

const MarkerDeclutterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
  // @ts-ignore
  const markerDeclutterGroup = L.LayerGroup.collision(props);

  //Remove everything outside the current view (Performance)
  markerDeclutterGroup._getExpandedVisibleBounds = function () {
    return markerDeclutterGroup._map.getBounds();
  };
  return {
    instance: markerDeclutterGroup,
    context: { ...ctx, layerContainer: markerDeclutterGroup },
  };
});

export default MarkerDeclutterGroup;
