import { Col, Input, Row, Upload } from 'antd';

import { isEmpty, pick } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CircleMarker,
    Map,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    withLeaflet
} from 'react-leaflet';
import Control from 'react-leaflet-control';
import PrintControlDefault from 'react-leaflet-easyprint';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-fullscreen/dist/styles.css';
import { usePosition } from 'use-position';
import ButtonControl from './components/button-control';
import FeatureGroupControl from './components/feature-group-control';
import ListPositionDraw from './components/list-position-draw';
import ModalChooseAction from './components/modal-choose-option';
import SelectColor from './components/radio-select-color';
// import MyMarkers from './components/show-marker';
import icon from './constants/IconMarker';
import IconMarkerPin from './constants/IconMarkerPin';
import { convertTime } from './helpers/convert-time';
import useGeoLocation from './hooks/geo-location';
import FullscreenControl from 'react-leaflet-fullscreen';

const PrintControl = withLeaflet(PrintControlDefault);

const ZOOM_LEVEL = 12;

const DamageAssessment = () => {
    const userLocation = useGeoLocation();
    const { latitude, longitude, error } = usePosition();

    const [center, setCenter] = useState();
    const [count, setCount] = useState(0);
    const [colorDraw, setColorDraw] = useState('red');
    const [map, setMap] = useState(null);
    const [styleDraw, setStyleDraw] = useState({
        color: '#ff0000',
        time: moment('00:10', 'mm:ss'),
        action: false
    });
    const [markerChecker, setMarkerChecker] = useState({});
    const [fileList, setFileList] = useState([]);
    const [locationMoving, setLocationMoving] = useState([]);
    const [listPositionDraw, setListPositionDraw] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [inprogress, setInprogress] = useState(false);
    const [isShowCurrent, setIsShowCurrent] = useState(false);

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onPreview = async file => {
        let src = file.url;
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow.document.write(image.outerHTML);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const mapRef = useRef();
    let onTimeout = useRef();

    useEffect(() => {
        if (userLocation) {
            setCenter({
                lat: userLocation.coordinates.lat,
                lng: userLocation.coordinates.lng
            });
        }
    }, [userLocation]);

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

            console.log([newLocation, ...locationMoving]);
            setLocationMoving([newLocation, ...locationMoving]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, inprogress]);

    const handleConvertListEdit = data => {
        return data.map(value => pick(value, ['lat', 'lng']));
    };

    const handleCreate = e => {
        const { layerType, layer } = e;
        const { _leaflet_id } = layer;

        if (layerType === 'polyline') {
            return setListPositionDraw(layers => [
                ...layers,
                { id: _leaflet_id, latlngs: layer.editing.latlngs[0] }
            ]);
        }

        if (layerType === 'polygon') {
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
                        ? {
                              ...l,
                              latlngs: handleConvertListEdit(
                                  editing.latlngs[0][0]
                              )
                          }
                        : l
                )
            )
        );
    };

    const handleEditVertex = e => {
        const { poly } = e;
        setListPositionDraw(layers =>
            layers.map(l =>
                l.id === poly._leaflet_id
                    ? {
                          ...l,
                          latlngs: handleConvertListEdit(
                              poly.editing.latlngs[0][0]
                          )
                      }
                    : l
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
            const { lat, lng } = userLocation.coordinates;
            mapRef.current.leafletElement.flyTo([lat, lng], 20, {
                animate: true
            });

            setIsShowCurrent(true);
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
    return (
        <>
            <Map
                center={center}
                zoom={ZOOM_LEVEL}
                ref={mapRef}
                style={{
                    height: '100vh'
                }}
                fullscreenControl={true}
                //whenReady the same with whenStart
                whenReady={e => setMap(e.target)}>
                {/* Ex for click to show marker on the map */}
                {/* {map && <MyMarkers isCheckMarker={isCheckMarker} map={map} />} */}
                {userLocation.loaded && !userLocation.error && isShowCurrent && (
                    <Marker
                        position={[
                            userLocation.coordinates.lat,
                            userLocation.coordinates.lng
                        ]}
                        icon={icon}>
                        <Popup>You are here.</Popup>
                    </Marker>
                )}
                {listPositionDraw &&
                    listPositionDraw.length > 0 &&
                    listPositionDraw.map(positionDraw =>
                        positionDraw.latlngs.map(position => (
                            <Marker position={position} icon={icon}>
                                <Popup>
                                    <Input placeholder="Input text" />
                                    <Upload
                                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={onChange}
                                        onPreview={onPreview}>
                                        {fileList.length < 5 && '+ Upload'}
                                    </Upload>
                                </Popup>
                            </Marker>
                        ))
                    )}
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
                {listPositionDraw && listPositionDraw.length > 0 && (
                    <Control position="topleft">
                        <Row className="control-action list-positions">
                            <ListPositionDraw
                                listPosition={listPositionDraw}
                                onSetMarkerChecker={handleSetMarkerChecker}
                                onUpdateListPosition={handleUpdateListPosition}
                            />
                        </Row>
                    </Control>
                )}
                {/* <Control position="topright">
                    <Button
                        onClick={() => setIsCheckMaker(!isCheckMarker)}
                        icon={<MessageOutlined />}
                        className="icon-note"
                    />
                </Control> */}
                <Control position="bottomright">
                    <Row className="control-action">
                        <Col>
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
                </Control>
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
                <PrintControl
                    position="topleft"
                    sizeModes={['Current', 'A4Portrait', 'A4Landscape']}
                    hideControlContainer={false}
                    title="Export as PNG"
                    exportOnly
                />
                <FeatureGroupControl
                    onCreate={handleCreate}
                    onEdited={handleEdited}
                    onDeleted={handleDeleted}
                    onEditVertex={handleEditVertex}
                    colorDraw={colorDraw}
                />
            </Map>

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
