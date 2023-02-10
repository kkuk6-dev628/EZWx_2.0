import { createContext, useContext } from 'react';
import { Layer } from 'leaflet';

export interface BaseMapLayers {
  usProvinces: Layer;
  canadianProvinces: Layer;
  countyWarningAreas: Layer;
  street: Layer;
  topo: Layer;
  terrain: Layer;
  dark: Layer;
  satellite: Layer;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const BaseMapLayersContext = createContext<BaseMapLayers>({} as any);

export const BaseMapLayersProvider = BaseMapLayersContext.Provider;

export function useBaseMapLayersContext() {
  const context = useContext(BaseMapLayersContext);

  if (context == null) {
    throw new Error(
      'No context provided: useBaseMapLayersContext() can only be used in a descendant of <BaseMapLayerControl>',
    );
  }

  return context;
}
