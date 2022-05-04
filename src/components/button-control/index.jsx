import React from 'react';
import PropTypes from 'prop-types';

const ButtonControl = ({
    mapLayers,
    onStopMoving,
    onStartMoving,
    isTouchCheck,
    onShow
}) => {
    return (
        <div className="row-info">
            <pre className="text-left">{JSON.stringify(mapLayers, 0, 2)}</pre>
            <div>
                <button
                    type="submit"
                    className="button-get-location button-unmove"
                    onClick={onStopMoving}>
                    Stop moving
                </button>
                <button
                    type="submit"
                    className="button-get-location button-moving"
                    onClick={onStartMoving}>
                    Start moving
                </button>
                {isTouchCheck && (
                    <button
                        type="submit"
                        className="button-get-location button-moving"
                        onClick={onStartMoving}>
                        Check
                    </button>
                )}
                <button
                    type="submit"
                    className="button-get-location"
                    onClick={onShow}>
                    Get my location
                </button>
            </div>
        </div>
    );
};

ButtonControl.propTypes = {
    mapLayers: PropTypes.array,
    onStopMoving: PropTypes.func,
    onStartMoving: PropTypes.func,
    onShow: PropTypes.func,
    isTouchCheck: PropTypes.bool
};

export default ButtonControl;
