import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from '../../constants/IconMarkerNoti';
import PropTypes from 'prop-types';

const MyMarkers = ({ map, isCheckMarker }) => {
    const [marker, setMarker] = useState([]);
    const [legend, setLegend] = useState();
    useEffect(() => {
        if (!map) return;
        const legend = L.control({ position: 'bottomleft' });

        const info = L.DomUtil.create('div', 'legend');

        legend.onAdd = () => {
            info.textContent = `click on the map`;
            return info;
        };

        legend.addTo(map);

        map.on('click', e => {
            const { lat, lng } = e.latlng;
            setMarker(mar => [...mar, [lat, lng]]);

            info.textContent = `new marker: ${e.latlng}`;
            setLegend(info);
        });
    }, [map]);

    const removeMarker = (index, map, legend) => {
        map.eachLayer(layer => {
            if (layer.options && layer.options.pane === 'markerPane') {
                if (layer.options.uniceid === index) {
                    map.removeLayer(layer);
                    legend.textContent = 'goodbye marker 💩';
                }
            }
        });
    };

    console.log('isCheckMarker', isCheckMarker);
    const ShowMarkers = ({ mapContainer, legend, markers }) => {
        if (!isCheckMarker) return <></>;
        return markers.map((marker, index) => {
            return (
                <Marker
                    key={index}
                    uniceid={index}
                    position={marker}
                    draggable={true}
                    eventHandlers={{
                        moveend(e) {
                            const { lat, lng } = e.target.getLatLng();
                            legend.textContent = `change position: ${lat} ${lng}`;
                        },
                        click(e) {
                            const location = e.target.getLatLng();
                            legend.flyToBounds([location]);
                        }
                    }}
                    icon={icon}>
                    <Popup>
                        <button
                            onClick={() =>
                                removeMarker(index, mapContainer, legend)
                            }>
                            delete marker 💔
                        </button>
                    </Popup>
                </Marker>
            );
        });
    };

    return marker.length > 0 && legend !== undefined ? (
        <ShowMarkers mapContainer={map} legend={legend} markers={marker} />
    ) : null;
};

MyMarkers.propTypes = {
    map: PropTypes.any,
    isCheckMarker: PropTypes.bool
};

export default MyMarkers;
