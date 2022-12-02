import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';

interface FeatureSelectorProps {
  features: L.Layer[];
  onSelect: (feature: L.Feature) => void;
}
const FeatureSelector = ({ features, onSelect }: FeatureSelectorProps) => {
  return (
    <BasePopupFrame title="Select Object">
      {features.map((layer) => {
        return (
          <span
            key={layer.feature.id}
            style={{ margin: 3 }}
            onClick={() => {
              onSelect(layer.feature);
            }}
          >
            {layer.feature.properties.hazard}
          </span>
        );
      })}
    </BasePopupFrame>
  );
};

export default FeatureSelector;
