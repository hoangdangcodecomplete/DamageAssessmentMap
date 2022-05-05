import React from 'react';
import PropTypes from 'prop-types';
import { Col, Radio, Typography } from 'antd';

function SelectColor({ onChangeColorDraw, colorSelect }) {
    return (
        <Col className="col-choose-color-draw">
            <Typography.Text>Choose color for draw line </Typography.Text>
            <Radio.Group onChange={onChangeColorDraw} value={colorSelect}>
                <Radio value="red">Red</Radio>
                <Radio value="blue">Blue</Radio>
                <Radio value="green">Green</Radio>
                <Radio value="black">Black</Radio>
            </Radio.Group>
        </Col>
    );
}

SelectColor.propTypes = {
    onChangeColorDraw: PropTypes.func,
    colorSelect: PropTypes.string
};

export default SelectColor;
