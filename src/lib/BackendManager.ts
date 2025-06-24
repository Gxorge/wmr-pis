export function getRTTData(serviceUid: string): Promise<RTTResponse> {
    return fetch("/api/" + serviceUid)
    .then(res => res.json())
    .then(res => {
        return res as RTTResponse
    })
}

export function getRTTLineupData(crs: string): Promise<RTTLocationLineup> {
    return fetch("/api/lineup/" + crs)
    .then(res => res.json())
    .then(res => {
        return res as RTTLocationLineup
    })
}

export async function whereIsTrain(serviceUid: string): Promise<RTTWhereIsTrain> {
    let data: RTTResponse = await getRTTData(serviceUid);
    let current = 0;
    for (let loc of data.locations) {
        if (loc.realtimeDepartureActual || loc.realtimeDepartureNoReport) {
            current++;
            continue;
        }

        let spliced = data.locations.splice(current+1);
        if (spliced.length == 0) spliced = data.locations.splice(current);

        return { 
            status: loc.serviceLocation, 

            location: loc.description, 
            locationCode: loc.crs, 

            for: spliced.at(-1)!!.description,
            forCode: spliced.at(-1)!!.crs, 

            callingAt: spliced.map(l => l.description),
            callingAtCodes: spliced.map(l => l.crs),
            
            displayAs: loc.displayAs 
        } as RTTWhereIsTrain;
    }

    let spliced = data.locations.splice(1);

    return { 
        status: "", 

        location: data.locations[data.locations.length-1].description, 
        locationCode: data.locations[data.locations.length-1].crs, 

        for: data.locations[data.locations.length-1].description, 
        forCode: data.locations[data.locations.length-1].crs, 

        callingAt: spliced.map(l => l.description),
        callingAtCodes: spliced.map(l => l.crs),

        displayAs: "DESTINATION"
    } as RTTWhereIsTrain
}

export async function getLocationLineup(crs: string): Promise<RTTLocationLineup> {
    let data: RTTLocationLineup = await getRTTLineupData(crs);
    return data;
}