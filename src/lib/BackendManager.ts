export const stationNames: Record<string, string> = {
    'SAV': "Stratford U Avon",
    'STY': "Stratford U A Pway",
    'BMO': "B'ham Moor St",
    'BSW': "B'ham Snow Hill",
    'SGB': "Smethwick G B",
    'SBJ': "Stourbridge Jcn",
    'WOS': "Worcester S Hill",
    'WOF': "Worcester F Street"
};

export const stationChanges: Record<string, string> = {
    'BMO': 'Banbury & London Marylebone. Alight for Bull Ring shopping centre and New Street station',
    'BSW': 'Colmore Business District',
    'THW': 'Connect with West Midlands Metro',
    'SGB': 'Wolverhampton, Crewe & Liverpool Lime St',
    'SBJ': 'Stourbridge Town',
    'DTW': 'Birmingham Snow Hill',
    'WOS': 'Oxford, Reading & London Paddington'
};

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

            location: stationNames[loc.crs] ?? loc.description, 
            locationFull: loc.description,
            locationCode: loc.crs, 
            change: stationChanges[loc.crs] ?? undefined,

            for: stationNames[spliced.at(-1)!!.crs] ?? spliced.at(-1)!!.description,
            forCode: spliced.at(-1)!!.crs, 

            callingAt: spliced.map(l => stationNames[l.crs] ?? l.description),
            callingAtCodes: spliced.map(l => l.crs),
            
            displayAs: loc.displayAs,
            terminated: (loc.displayAs == "DESTINATION" && loc.realtimeArrivalActual)
        } as RTTWhereIsTrain;
    }

    let spliced = data.locations.splice(1);

    return { 
        status: "", 

        location: stationNames[data.locations[data.locations.length-1].crs] ?? data.locations[data.locations.length-1].description, 
        locationFull: data.locations[data.locations.length-1].description, 
        locationCode: data.locations[data.locations.length-1].crs, 
        change: stationChanges[data.locations[data.locations.length-1].crs] ?? undefined,

        for: stationNames[data.locations[data.locations.length-1].crs] ?? data.locations[data.locations.length-1].description, 
        forCode: data.locations[data.locations.length-1].crs, 

        callingAt: spliced.map(l => stationNames[l.crs] ?? l.description),
        callingAtCodes: spliced.map(l => l.crs),

        displayAs: "DESTINATION",
        terminated: true
    } as RTTWhereIsTrain
}

export async function getLocationLineup(crs: string): Promise<RTTLocationLineup> {
    let data: RTTLocationLineup = await getRTTLineupData(crs);
    return data;
}