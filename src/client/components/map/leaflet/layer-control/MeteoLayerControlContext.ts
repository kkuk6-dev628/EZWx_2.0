import { ILayerObj } from './LayerControl';
import { createContext, useContext } from 'react';
import { Layer } from 'leaflet';

export interface MeteoLayers {
  metar: Layer;
  nbmMarkers: Layer;
  pirep: Layer;
  radar: Layer;
  sigmet: Layer;
  intlSigmet: Layer;
  convectiveOutlooks: Layer;
  cwa: Layer;
  gairmet: Layer;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const MeteoLayersContext = createContext<MeteoLayers>({} as any);

export const MeteoLayersProvider = MeteoLayersContext.Provider;

export function useMeteoLayersContext() {
  const context = useContext(MeteoLayersContext);

  if (context == null) {
    throw new Error('No context provided: useLayerControlContext() can only be used in a descendant of <LayerControl>');
  }

  return context;
}
