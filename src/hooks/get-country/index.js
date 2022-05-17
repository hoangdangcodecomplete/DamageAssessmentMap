import { useEffect, useState } from 'react';

function useGeoCountry() {
    const [country, setCountry] = useState();

    useEffect(() => {
        fetch(
            'https://api.opencagedata.com/geocode/v1/json?key=0f877454e3054c7e8d1546166884ef2a&q=Vietnam'
        )
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                setCountry(payload.results[0].geometry);
            });
    }, []);

    return country;
}
export default useGeoCountry;
