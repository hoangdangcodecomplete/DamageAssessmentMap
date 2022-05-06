import { Col, Row } from 'antd';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CircleMarker,
    FeatureGroup,
    Map,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    withLeaflet
} from 'react-leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { EditControl } from 'react-leaflet-draw';
import PrintControlDefault from 'react-leaflet-easyprint';
import { usePosition } from 'use-position';
import ButtonControl from './components/button-control';
import ListPositionDraw from './components/list-position-draw';
import ModalChooseAction from './components/modal-choose-option';
import SelectColor from './components/radio-select-color';
import icon from './constants/IconMarker';
import IconMarkerPin from './constants/IconMarkerPin';
import { convertTime } from './helpers/convert-time';
import useGeoLocation from './hooks/geo-location';

const PrintControl = withLeaflet(PrintControlDefault);

const ZOOM_LEVEL = 20;

const DamageAssessment = () => {
    const userLocation = useGeoLocation();
    const { latitude, longitude, error } = usePosition();

    const [center, setCenter] = useState({ lat: 51.51, lng: -0.06 });
    const [listPositionDraw, setListPositionDraw] = useState([]);
    const [count, setCount] = useState(0);
    const [inprogress, setInprogress] = useState(false);
    const [locationMoving, setLocationMoving] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [styleDraw, setStyleDraw] = useState({
        color: '#ff0000',
        time: moment('00:10', 'mm:ss'),
        action: false
    });
    const [markerChecker, setMarkerChecker] = useState({});
    const [colorDraw, setColorDraw] = useState('red');

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const mapRef = useRef();
    const printControl = useRef();
    let onTimeout = useRef();

    useEffect(() => {
        const timeCheck =
            convertTime(moment(styleDraw.time).format('mm:ss')) * 1000;
        if (typeof count === 'number' && inprogress && !styleDraw.action) {
            onTimeout.current = setTimeout(() => {
                setCount(c => c + 10000);
            }, timeCheck);
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
            let newLocation = {
                lat: latitude,
                lng: longitude
            };
            setLocationMoving([newLocation, ...locationMoving]);
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
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const { _leaflet_id } = layer;
            console.log(layer.getLatLngs());
            setListPositionDraw(layers => [
                ...layers,
                { id: _leaflet_id, latlngs: layer.getLatLngs()[0] }
            ]);
        }
    };

    const handleEdited = e => {
        const {
            layers: { _layers }
        } = e;

        Object.values(_layers).map(({ _leaflet_id, editing }) =>
            setListPositionDraw(layers =>
                layers.map(l =>
                    l.id === _leaflet_id
                        ? { ...l, latlngs: { ...editing.latlngs[0] } }
                        : l
                )
            )
        );
    };

    const handleDeleted = e => {
        const {
            layers: { _layers }
        } = e;

        Object.values(_layers).map(({ _leaflet_id }) =>
            setListPositionDraw(layers =>
                layers.filter(l => l.id !== _leaflet_id)
            )
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
        if (styleDraw.action) {
            return setStyleDraw({ ...styleDraw, action: false });
        }
        clearTimeout(onTimeout.current);
    };

    const handleChangeStyle = values => {
        setStyleDraw(values);
        setIsModalVisible(false);
        if (values.action) return;
        setInprogress(true);
    };

    const handleSetMarkerChecker = useCallback(
        value => {
            setMarkerChecker(value);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [markerChecker]
    );

    const handleUpdateListPosition = value => {
        setListPositionDraw(value);
    };

    const handleUpdateColorDraw = e => {
        console.log('e.target.value: ' + e.target.value);
        setColorDraw(e.target.value);
    };

    const handelTouchCheckPoint = () => {
        if (styleDraw.action && latitude && longitude && !error) {
            let newLocation = {
                lat: latitude,
                lng: longitude
            };
            return setLocationMoving([newLocation, ...locationMoving]);
        }
    };
    console.log('locationMoving', locationMoving);
    return (
        <>
            <Map
                center={{ lat: 51.51, lng: -0.06 }}
                zoom={ZOOM_LEVEL}
                ref={mapRef}
                style={{ height: '50vh' }}>
                <Marker position={center} icon={icon}>
                    <Popup>You are here.</Popup>
                </Marker>

                {markerChecker && !isEmpty(markerChecker) && (
                    <Marker position={markerChecker} icon={IconMarkerPin}>
                        <Popup>
                            You are here.
                            <input
                                type="file"
                                id="myfile"
                                name="myfile"
                                onChange={e => console.log(e.target.value)}
                            />
                        </Popup>
                    </Marker>
                )}
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt1', 'mt2', 'mt3']}
                />
                <Polyline color={styleDraw.color} positions={locationMoving} />
                {locationMoving &&
                    locationMoving.length > 0 &&
                    locationMoving.map(
                        (loca, index) =>
                            JSON.stringify(loca) !== JSON.stringify(center) && (
                                <CircleMarker
                                    key={index}
                                    center={loca}
                                    fill={true}
                                    color={styleDraw.color}
                                    radius={3}>
                                    <Popup>
                                        <b>lat:</b> {loca?.lat} <br />
                                        <b>lng:</b> {loca?.lng} <br />
                                    </Popup>
                                </CircleMarker>
                            )
                    )}

                {listPositionDraw &&
                    listPositionDraw.length > 0 &&
                    listPositionDraw.map(layer =>
                        layer.latlngs.map((location, index) => (
                            <CircleMarker
                                key={index}
                                center={location}
                                fill={true}
                                color="#ff0000"
                                radius={3}>
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
                            </CircleMarker>
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
                            polyline: {
                                shapeOptions: { color: colorDraw },
                                allowIntersection: false,
                                showLength: true,
                                metric: false,
                                feet: false
                            },
                            polygon: {
                                allowIntersection: false,
                                shapeOptions: { color: colorDraw },
                                edit: false,
                                showLength: true,
                                metric: false,
                                feet: false,
                                showArea: true
                            },
                            rectangle: {
                                shapeOptions: { color: colorDraw },
                                showLength: true,
                                metric: false,
                                feet: false,
                                showArea: true
                            },
                            circle: {
                                shapeOptions: { color: colorDraw },
                                showLength: true,
                                metric: false,
                                feet: false,
                                showArea: true
                            },
                            marker: {
                                zIndexOffset: '999',
                                edit: true,
                                icon: icon
                            }
                        }}
                    />
                </FeatureGroup>
            </Map>
            <Row>
                <Col span={12}>
                    <ListPositionDraw
                        listPosition={listPositionDraw}
                        onSetMarkerChecker={handleSetMarkerChecker}
                        onUpdateListPosition={handleUpdateListPosition}
                    />
                </Col>
                <Col span={12}>
                    <ButtonControl
                        onStopMoving={handleStopMoving}
                        onStartMoving={showModal}
                        onShow={showMyLocation}
                        isTouchCheck={styleDraw.action}
                        onTouchCheckPoint={handelTouchCheckPoint}
                    />
                    <SelectColor
                        onChangeColorDraw={handleUpdateColorDraw}
                        colorSelect={colorDraw}
                    />
                </Col>
            </Row>

            <ModalChooseAction
                isModalVisible={isModalVisible}
                onCancel={handleCancel}
                iniStyle={styleDraw}
                onChangeStyle={handleChangeStyle}
            />
        </>
    );
};

export default DamageAssessment;
