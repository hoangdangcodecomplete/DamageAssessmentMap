import { useEffect, useState } from 'react';

function useGeoCountry() {
    const [country, setCountry] = useState();

    useEffect(() => {
        fetch('https://api.ipregistry.co/?key=tryout')
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                setCountry(payload.location);
            });
    }, []);

    return country;
}
export default useGeoCountry;
