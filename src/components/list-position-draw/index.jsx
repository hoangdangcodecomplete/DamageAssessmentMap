import { Col, Collapse, List, Row, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const { Panel } = Collapse;

const ListPositionDraw = ({ listPosition, onSetMarkerChecker }) => {
    if (!listPosition || listPosition.length <= 0) return <></>;

    //method for delete position on list manager
    // const handleDeletedPosition = (position, idLayer) => {
    //     let newArray = [];

    //     map(listPosition, function (location) {
    //         if (location.id === idLayer) {
    //             location = {
    //                 ...location,
    //                 latlngs: filter(location.latlngs, function (o) {
    //                     return o.lat !== position.lat;
    //                 })
    //             };
    //         }
    //         newArray.push(location);
    //     });
    //     onUpdateListPosition(newArray);
    // };

    return (
        <>
            {listPosition.map((layer, i) => (
                <Collapse
                    key={i + layer.id}
                    index={i}
                    className="fomat-collapsed">
                    <Panel header={`This is position ${layer.id}`}>
                        <List
                            bordered
                            dataSource={layer.latlngs}
                            renderItem={(item, index) => (
                                <List.Item key={index}>
                                    <Row justify="space-between">
                                        <Col
                                            onClick={() =>
                                                onSetMarkerChecker(item)
                                            }>
                                            <Typography.Text mark>
                                                Location {index + 1}:{' '}
                                                {JSON.stringify(item)}
                                            </Typography.Text>
                                        </Col>
                                        {/* <Col>
                                            <Button
                                                type="primary"
                                                icon={
                                                    <DeleteOutlined
                                                        onClick={() =>
                                                            handleDeletedPosition(
                                                                item,
                                                                layer.id
                                                            )
                                                        }
                                                    />
                                                }
                                                size="small"
                                            />
                                        </Col> */}
                                    </Row>
                                </List.Item>
                            )}
                        />
                    </Panel>
                </Collapse>
            ))}
        </>
    );
};

ListPositionDraw.propTypes = {
    listPosition: PropTypes.array,
    onSetMarkerChecker: PropTypes.func,
    onUpdateListPosition: PropTypes.func
};

export default ListPositionDraw;
