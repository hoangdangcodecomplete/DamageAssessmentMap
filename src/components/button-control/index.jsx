import { Button, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const ButtonControl = ({
    onStopMoving,
    onStartMoving,
    isTouchCheck,
    onShow,
    onTouchCheckPoint
}) => {
    return (
        <>
            {isTouchCheck && (
                <Col>
                    <Button
                        type="primary"
                        shape="round"
                        onClick={onTouchCheckPoint}>
                        Check
                    </Button>
                </Col>
            )}
            <Col>
                <Button type="primary" shape="round" onClick={onStartMoving}>
                    Start moving
                </Button>
            </Col>
            <Col>
                <Button
                    type="primary"
                    shape="round"
                    danger
                    onClick={onStopMoving}>
                    Stop moving
                </Button>
            </Col>
            <Col>
                <Button shape="round" onClick={onShow}>
                    Get my location
                </Button>
            </Col>
        </>
        //     </Col>
        // </>
    );
};

ButtonControl.propTypes = {
    onStopMoving: PropTypes.func,
    onStartMoving: PropTypes.func,
    onShow: PropTypes.func,
    isTouchCheck: PropTypes.bool,
    onTouchCheckPoint: PropTypes.func
};

export default ButtonControl;
