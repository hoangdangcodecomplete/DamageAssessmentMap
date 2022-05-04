import React, { useState, useRef, useEffect } from 'react';
import {
    Map,
    TileLayer,
    FeatureGroup,
    Marker,
    Popup,
    withLeaflet,
    Polyline,
    CircleMarker
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw';
import PrintControlDefault from 'react-leaflet-easyprint';
import { usePosition } from 'use-position';
import icon from './constants/IconMarker';
import IconMarkerPin from './constants/IconMarkerPin';
import ButtonControl from './components/button-control';
import useGeoLocation from './hooks/geo-location';
import { listLocationUser } from './resources/data/list-positions.js';

const PrintControl = withLeaflet(PrintControlDefault);

const ZOOM_LEVEL = 16;

const DamageAssessment = () => {
    const userLocation = useGeoLocation();
    const { latitude, longitude, error } = usePosition();

    const [center, setCenter] = useState({ lat: 51.51, lng: -0.06 });
    const [mapLayers, setMapLayers] = useState([]);
    const [count, setCount] = useState(0);
    const [inprogress, setInprogress] = useState(false);
    const [locationMoving, setLocationMoving] = useState([]);

    const mapRef = useRef();
    const printControl = useRef();
    let onTimeout = useRef();

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
            if (!inprogress) return;
            let newListMoving = [];

            let indexLocation = count / 10000;
            console.log('indexLocation', indexLocation);
            if (count === 0) {
                newListMoving.push(listLocationUser[count]);
            } else if (indexLocation >= listLocationUser.length) {
                setInprogress(false);
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

    const handleCreate = e => {
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

    const handleEdited = e => {
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

    const handleDeleted = e => {
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

    const handleStartMoving = () => {
        alert('Start moving!');
        setInprogress(true);
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
                                <CircleMarker
                                    key={index}
                                    center={loca}
                                    fill={true}
                                    color="#220bb9"
                                    radius={3}>
                                    <Popup>
                                        <b>lat:</b> {loca?.lat} <br />
                                        <b>lng:</b> {loca?.lng} <br />
                                    </Popup>
                                </CircleMarker>
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
                        onCreated={handleCreate}
                        onEdited={handleEdited}
                        onDeleted={handleDeleted}
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
            <ButtonControl
                mapLayers={mapLayers}
                onStopMoving={handleStopMoving}
                onStartMoving={handleStartMoving}
                onShow={showMyLocation}
            />
        </div>
    );
};

export default DamageAssessment;
