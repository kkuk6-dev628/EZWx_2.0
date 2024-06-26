import { LeafletProvider, useLeafletContext } from '@react-leaflet/core';
import { Layer } from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactNode } from 'react';
import { useMeteoLayersContext } from './MeteoLayerControlContext';
import { useMap } from 'react-leaflet';

export interface OrderedLayerProps {
  checked: boolean;
  addLayerToStore?: (groupedLayer: Layer) => any;
  children: ReactNode[] | ReactNode;
}

const createControlledLayer = (
  addLayerToControl: (layerContext: any, layer: Layer, options: OrderedLayerProps) => any,
) => {
  const ControlledLayer = (props: OrderedLayerProps) => {
    const context = useLeafletContext();
    const layerContext = useMeteoLayersContext();
    const propsRef = useRef(props);
    const parentMap = useMap();

    const [layer, setLayer] = useState<Layer | null>(null);

    const addLayer = useCallback(
      (layerToAdd) => {
        if (propsRef.current.checked) {
          parentMap.addLayer(layerToAdd);
        }

        if (propsRef.current.addLayerToStore) propsRef.current.addLayerToStore(layerToAdd);
        addLayerToControl(layerContext, layerToAdd, propsRef.current);
        setLayer(layerToAdd);
      },
      [context],
    );

    const removeLayer = useCallback(
      (layerToRemove) => {
        context.layersControl?.removeLayer(layerToRemove);
        setLayer(null);
      },
      [context],
    );

    const newContext = useMemo(() => {
      return context
        ? Object.assign({}, context, {
            layerContainer: {
              addLayer,
              removeLayer,
            },
          })
        : null;
    }, [context, addLayer, removeLayer]);

    useEffect(() => {
      if (layer !== null && propsRef.current !== props) {
        if (props.checked === true && (propsRef.current.checked == null || propsRef.current.checked === false)) {
          parentMap.addLayer(layer);
        } else if (propsRef.current.checked === true && (props.checked == null || props.checked === false)) {
          parentMap.removeLayer(layer);
        }

        propsRef.current = props;
      }

      return () => {
        if (layer !== null) {
          context.layersControl?.removeLayer(layer);
        }
      };
    });

    return props.children
      ? React.createElement(
          LeafletProvider,
          {
            value: newContext,
          },
          props.children,
        )
      : null;
  };

  return ControlledLayer;
};

export default createControlledLayer;
