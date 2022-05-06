import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'antd';

const ButtonControl = ({
    onStopMoving,
    onStartMoving,
    isTouchCheck,
    onShow,
    onTouchCheckPoint
}) => {
    return (
        <Row gutter={[8, 8]}>
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
        </Row>
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
