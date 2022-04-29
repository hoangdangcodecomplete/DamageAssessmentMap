import React, { useState, useRef, useEffect } from 'react';
import {
    Map,
    TileLayer,
    FeatureGroup,
    Marker,
    Popup,
    withLeaflet,
    Polyline
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw';
import PrintControlDefault from 'react-leaflet-easyprint';
import { usePosition } from 'use-position';
import icon from './constants/IconMarker';
import IconMarkerPin from './constants/IconMarkerPin';

const PrintControl = withLeaflet(PrintControlDefault);

const listLocationUser = [
    {
        lat: 16.0742517,
        lng: 108.2186261
    },
    {
        lat: 16.07414,
        lng: 108.217333
    },
    {
        lat: 16.074088,
        lng: 108.216818
    },
    {
        lat: 16.073934,
        lng: 108.216174
    },

    {
        lat: 16.073851,
        lng: 108.21525
    },
    {
        lat: 16.073665,
        lng: 108.214813
    },
    {
        lat: 16.073542,
        lng: 108.21393
    },
    {
        lat: 16.072284,
        lng: 108.213139
    },
    {
        lat: 16.071665,
        lng: 108.213246
    },
    {
        lat: 16.07216,
        lng: 108.216842
    },
    {
        lat: 16.072428,
        lng: 108.218439
    },
    {
        lat: 16.072773,
        lng: 108.220883
    },
    {
        lat: 16.072773,
        lng: 108.220883
    },
    {
        lat: 16.074835,
        lng: 108.220603
    },
    {
        lat: 16.0742517,
        lng: 108.2186261
    },
];

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

const ZOOM_LEVEL = 15;

const Leaflet = () => {
    const userLocation = useGeoLocation();

    const [center, setCenter] = useState({ lat: 51.51, lng: -0.06 });
    const [mapLayers, setMapLayers] = useState([]);
    const [count, setCount] = useState(0);
    const [inprogress, setInprogress] = useState(false);
    const [locationMoving, setLocationMoving] = useState([]);

    const mapRef = useRef();
    const printControl = useRef();
    let onTimeout = useRef();

    const { latitude, longitude, error } = usePosition();

    useEffect(() => {
        if (typeof count === 'number' && inprogress) {
            onTimeout.current = setTimeout(() => {
                setCount(c => c + 10000);
            }, 1000);
        }

        return () => {
            clearTimeout(onTimeout.current);
        };
    });

    useEffect(() => {
        if (latitude && longitude && !error) {
            // Fetch weather data here.
            console.log('latitude', latitude);
            console.log('longitude', longitude);    
            console.log('count', count);

            let newListMoving = [];

            let indexLocation = count / 10000;
            console.log('indexLocation',indexLocation);
            if (count === 0) {
                newListMoving.push(listLocationUser[count]);
            } else if (indexLocation === listLocationUser.length) {
                return clearTimeout(onTimeout.current);
            } else {
                newListMoving.push(listLocationUser[indexLocation]);
            }

            setLocationMoving([...newListMoving, ...locationMoving]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, inprogress]);

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

    const handleStopMoving = () => {
        alert('Stop moving!');
        clearTimeout(onTimeout.current);
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

                {locationMoving &&
                    locationMoving.length > 0 &&
                    locationMoving.map(
                        (loca, index) =>
                            JSON.stringify(loca) !== JSON.stringify(center) && (
                                <Marker
                                    key={index}
                                    position={loca}
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
                            )
                    )}
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt1', 'mt2', 'mt3']}
                />
                <Polyline color="#220bb9" positions={locationMoving} />
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
                <div>
                    <button
                        type="submit"
                        className="button-get-location button-unmove"
                        onClick={handleStopMoving}>
                        Stop moving
                    </button>
                    <button
                        type="submit"
                        className="button-get-location button-moving"
                        onClick={() => {
                            alert('Start moving!');
                            setInprogress(true);
                        }}>
                        Start moving
                    </button>
                    <button
                        type="submit"
                        className="button-get-location"
                        onClick={showMyLocation}>
                        Get my location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Leaflet;
