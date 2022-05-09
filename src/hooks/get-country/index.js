import { useEffect, useState } from 'react';

function useGeoCountry() {
    const [country, setCountry] = useState();

    useEffect(() => {
        fetch('http://ip-api.com/json')
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                setCountry(payload);
            });
    }, []);

    return country;
}
export default useGeoCountry;
