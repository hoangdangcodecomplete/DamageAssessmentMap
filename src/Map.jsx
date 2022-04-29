import React, { useState, useRef, useEffect } from 'react';
import {
    Map,
    TileLayer,
    FeatureGroup,
    Marker,
    Popup,
    withLeaflet
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw';
import PrintControlDefault from 'react-leaflet-easyprint';
import icon from './constants/IconMarker';
import IconMarkerPin from './constants/IconMarkerPin';

const PrintControl = withLeaflet(PrintControlDefault);

const useGeoLocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: '', lng: '' }
    });

    const onSuccess = location => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude
            }
        });
    };

    const onError = error => {
        setLocation({
            loaded: true,
            error: {
                code: error.code,
                message: error.message
            }
        });
    };

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            onError({
                code: 0,
                message: 'Geolocation not supported'
            });
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, []);

    return location;
};

const Leaflet = () => {
    const [center, setCenter] = useState({ lat: 51.51, lng: -0.06 });
    const [mapLayers, setMapLayers] = useState([]);

    const userLocation = useGeoLocation();

    const ZOOM_LEVEL = 15;
    const mapRef = useRef();
    const printControl = useRef();

    useEffect(() => {
        if (userLocation.loaded && userLocation.error) return;
        setCenter({
            lat: userLocation.coordinates.lat,
            lng: userLocation.coordinates.lng
        });
    }, [userLocation]);

    const _onCreate = e => {
        console.log(e);

        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const { _leaflet_id } = layer;

            setMapLayers(layers => [
                ...layers,
                { id: _leaflet_id, latlngs: layer.getLatLngs()[0] }
            ]);
        }
    };

    const _onEdited = e => {
        console.log(e);
        const {
            layers: { _layers }
        } = e;

        Object.values(_layers).map(({ _leaflet_id, editing }) =>
            setMapLayers(layers =>
                layers.map(l =>
                    l.id === _leaflet_id
                        ? { ...l, latlngs: { ...editing.latlngs[0] } }
                        : l
                )
            )
        );
    };

    const _onDeleted = e => {
        console.log(e);
        const {
            layers: { _layers }
        } = e;

        Object.values(_layers).map(({ _leaflet_id }) =>
            setMapLayers(layers => layers.filter(l => l.id !== _leaflet_id))
        );
    };

    const showMyLocation = () => {
        if (userLocation.loaded && !userLocation.error) {
            mapRef.current.leafletElement.flyTo(
                [userLocation.coordinates.lat, userLocation.coordinates.lng],
                ZOOM_LEVEL,
                { animate: true }
            );
            setCenter({
                lat: userLocation.coordinates.lat,
                lng: userLocation.coordinates.lng
            });
        } else {
            alert(userLocation.error.message);
        }
    };
    return (
        <div>
            <Map
                center={{ lat: 51.51, lng: -0.06 }}
                zoom={ZOOM_LEVEL}
                ref={mapRef}
                style={{ height: '50vh' }}>
                <Marker position={center} icon={icon}>
                    <Popup>You are here.</Popup>
                </Marker>

                {mapLayers &&
                    mapLayers.length > 0 &&
                    mapLayers.map(layer =>
                        layer.latlngs.map((location, index) => (
                            <Marker
                                key={index}
                                position={location}
                                icon={IconMarkerPin}>
                                <Popup>
                                    You are here.
                                    <input
                                        type="file"
                                        id="myfile"
                                        name="myfile"
                                        onChange={e =>
                                            console.log(e.target.value)
                                        }
                                    />
                                </Popup>
                            </Marker>
                        ))
                    )}
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                />
                <PrintControl
                    ref={printControl}
                    position="topleft"
                    sizeModes={['Current', 'A4Portrait', 'A4Landscape']}
                    hideControlContainer={false}
                />
                <PrintControl
                    position="topleft"
                    sizeModes={['Current', 'A4Portrait', 'A4Landscape']}
                    hideControlContainer={false}
                    title="Export as PNG"
                    exportOnly
                />
                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: true,
                            polyline: true,
                            circle: true,
                            circlemarker: true,
                            marker: true
                        }}
                    />
                </FeatureGroup>
            </Map>
            <div className="row-info">
                <pre className="text-left">
                    {JSON.stringify(mapLayers, 0, 2)}
                </pre>
                <button
                    type="submit"
                    className="button-get-location"
                    onClick={showMyLocation}>
                    Get my location
                </button>
            </div>
        </div>
    );
};

export default Leaflet;
