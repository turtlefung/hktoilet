var BASE_API_URL_ARR = "https://bustime.mta.info/api/siri/stop-monitoring.json?key=c8a30f0b-5ac8-450e-9d9d-1167bd00bcd1&OperatorRef=MTA&MonitoringRef=308209&LineRef=MTA%20NYCT_B63";

var API_KEY = "c8a30f0b-5ac8-450e-9d9d-1167bd00bcd1"

export const getallagencies = async () => {

    const endpoint = "http://bustime.mta.info/api/where/agencies-with-coverage.xml?key=" + API_KEY;
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any agencies" };
            }
            return response.text();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}

export const getallroutesbyagency = async (agency) => {

    const endpoint = "https://bustime.mta.info/api/where/routes-for-agency/" + agency + ".xml?key=" + API_KEY;
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any routes" };
            }
            return response.text();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}

export const getroutedetails = async (route_id) => {

    const endpoint = "https://bustime.mta.info/api/where/stops-for-route/" + route_id + ".json?key=" + API_KEY + "&includePolylines=false&version=2";
    console.log(endpoint)
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any routes" };
            }
            return response.json();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}

export const getarrivaltime = async (route_id, code) => {

    const endpoint = "https://bustime.mta.info/api/siri/stop-monitoring.json?key=" + API_KEY + "&MonitoringRef=" + code  + "&LineRef=" + route_id;
    //console.log(endpoint)
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any routes" };
            }
            return response.json();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}

export const getallstopbylocation = async (location) => {

    const endpoint = "https://bustime.mta.info/api/where/stops-for-location.json?lat=40.748433&lon=-73.985656&latSpan=0.005&lonSpan=0.005&key=c8a30f0b-5ac8-450e-9d9d-1167bd00bcd1" + API_KEY;
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any routes" };
            }
            console.log(response)
            return response.json();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}