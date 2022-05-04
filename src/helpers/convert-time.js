export const convertTime = duration => {
    const [minutes, seconds] = duration.split(':');
    return Number(minutes) * 60 + Number(seconds);
};
