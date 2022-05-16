import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

const FeatureGroupControl = ({
    onCreate,
    onEdited,
    onDeleted,
    onEditVertex,
    colorDraw
}) => {
    return (
        <FeatureGroup>
            <EditControl
                position="topright"
                onCreated={onCreate}
                onEdited={onEdited}
                onDeleted={onDeleted}
                onEditVertex={onEditVertex}
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
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false
                }}
            />
        </FeatureGroup>
    );
};

FeatureGroupControl.propTypes = {
    onCreate: PropTypes.func,
    onEdited: PropTypes.func,
    onDeleted: PropTypes.func,
    onEditVertex: PropTypes.func,
    colorDraw: PropTypes.string
};

export default FeatureGroupControl;
