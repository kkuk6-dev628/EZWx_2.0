import Map from './LeafletMap';

function LeafletMap() {
  return (
    <Map
      bounds={[
        [55.0, -130.0],
        [20.0, -60.0],
      ]}
    >
      {({ TileLayer, Marker, Popup }) => (
        <>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          <Marker position={[38.907132, -77.036546]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </>
      )}
    </Map>
  );
}

export default LeafletMap;
