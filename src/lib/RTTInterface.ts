interface RTTResponse {
    serviceUid: string,
    runDate: string,
    serviceType: string,
    isPassenger: boolean,
    trainIdentity: string,
    powerType: string,
    trainClass: string,
    atocCode: string,
    atocName: string,
    performanceMonitored: boolean,
    origin: {
        tiploc: string,
        description: string,
        workingTime: string,
        publicTime: string
    }[],
    destination: {
        tiploc: string,
        description: string,
        workingTime: string,
        publicTime: string
    }[],
    locations: {
        realtimeActivated: boolean,
        tiploc: string,
        crs: string,
        description: string,
        gbttBookedArrival: string,
        gbttBookedDeparture: string,
        origin: {
            tiploc: string,
            description: string,
            workingTime: string,
            publicTime: string
        }[],
        destination: {
            tiploc: string,
            description: string,
            workingTime: string,
            publicTime: string
        }[],
        isCall: boolean,
        isPublicCall: boolean,
        realtimeArrival: string,
        realtimeArrivalActual: boolean,
        realtimeDeparture: string,
        realtimeDepartureActual: boolean,
        realtimeDepartureNoReport: boolean,
        displayAs: string,
        serviceLocation: string, // APPR_PLAT, AT_PLAT, APPR_STAT
    }[],
    realtimeActivated: boolean,
    runningIdentity: string
};

interface RTTWhereIsTrain {
    status: string,
    location: string,
    locationFull: string,
    locationCode: string,
    for: string,
    forCode: string,
    callingAt: string[],
    callingAtCodes: string[],
    displayAs: string,
    terminated: boolean,
}

interface RTTLocationLineup {
    location: {
        name: string,
        crs: string,
        tiploc: string,
        country: string,
        system: string
    },
    services: {
        locationDetail: {
            realtimeActivated: boolean,
            tiploc: string,
            crs: string,
            description: string,
            gbttBookedArrival: string,
            gbttBookedDeparture: string,
            origin: {
                tipLoc: string,
                description: string,
                workingTime: string,
                publicTime: string
            }[],
            destination: {
                tipLoc: string,
                description: string,
                workingTime: string,
                publicTime: string
            }[],
            isCall: boolean,
            isPubLicCall: true,
            realtimeArrival: string,
            realtimeArrivalActual: boolean,
            realtimeDeparture: string,
            realtimeDepatureActual: boolean,
            displayAs: string,
            platform: string | undefined,
        },
        serviceUid: string,
        runDate: string,
        trainIdentity: string,
        runningIdentity: string,
        atocCode: string,
        atocName: string,
        serviceType: string,
        isPassenger: boolean
    }[]
}