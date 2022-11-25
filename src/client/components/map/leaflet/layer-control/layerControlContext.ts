import { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const LayersControlContext = createContext<any>([[], () => {}]);

export const LayersControlProvider = LayersControlContext.Provider;

export function useLayerControlContext() {
  const context = useContext(LayersControlContext);

  if (context == null) {
    throw new Error(
      'No context provided: useLayerControlContext() can only be used in a descendant of <LayerControl>',
    );
  }

  return context;
}
