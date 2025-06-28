export function hideAllButFooter() {
    document.getElementById('wmr-double')!!.style.display = "none";
    document.getElementById('wmr-journey-complete')!!.style.display = "none";
    document.getElementById('wmr-platform-step')!!.style.display = "none";
    document.getElementById('wmr-platform-pushchair')!!.style.display = "none";
    document.getElementById('wmr-logo-only')!!.style.display = "none";
    document.getElementById('wmr-connections')!!.style.display = "none";
    document.getElementById('wmr-samaritans')!!.style.display = "none";
    document.getElementById('wmr-ontherails')!!.style.display = "none";

    document.getElementById('wmr-footer')!!.style.display = "flex";
    document.getElementById('wmr-footer-text')!!.style.display = "flex";
}

export function hideAll() {
    document.getElementById('wmr-double')!!.style.display = "none";
    document.getElementById('wmr-journey-complete')!!.style.display = "none";
    document.getElementById('wmr-platform-step')!!.style.display = "none";
    document.getElementById('wmr-platform-pushchair')!!.style.display = "none";
    document.getElementById('wmr-logo-only')!!.style.display = "none";
    document.getElementById('wmr-connections')!!.style.display = "none";
    document.getElementById('wmr-samaritans')!!.style.display = "none";
    document.getElementById('wmr-ontherails')!!.style.display = "none";

    document.getElementById('wmr-footer')!!.style.display = "none";
    document.getElementById('wmr-footer-text')!!.style.display = "none";
}

export function showFooter() {
    document.getElementById('wmr-footer')!!.style.display = "flex";
    document.getElementById('wmr-footer-text')!!.style.display = "flex";
}

export function defaultToLogo(keepFooterText: boolean = false): void {
    if (!keepFooterText)
      document.getElementById('wmr-footer-text')!!.innerHTML = "";

    hideAllButFooter();
    document.getElementById('wmr-logo-only')!!.style.display = "flex";
}

export function approaching(station: string): void {
    document.getElementById('wmr-double-top')!!.innerHTML = "We are now approaching";
    document.getElementById('wmr-double-bottom')!!.innerHTML = station;

    document.getElementById('wmr-footer-text')!!.innerHTML = "The next station is " + station;

    document.getElementById('wmr-platform-step-station')!!.innerHTML = station;
    document.getElementById('wmr-platform-pushchair-station')!!.innerHTML = station;

    hideAllButFooter();
    document.getElementById('wmr-double')!!.style.display = "flex";
}

export function approachingPlatformStep(): void {
    hideAllButFooter();
    document.getElementById('wmr-platform-step')!!.style.display = "flex";
}

export function approachingPlatformPushchair(): void {
    hideAllButFooter();
    document.getElementById('wmr-platform-pushchair')!!.style.display = "flex";
}

export function thisIs(station: string): void {
    document.getElementById('wmr-double-top')!!.innerHTML = "This is";
    document.getElementById('wmr-double-bottom')!!.innerHTML = station;

    document.getElementById('wmr-footer-text')!!.innerHTML = "This station is " + station;

    hideAllButFooter();
    document.getElementById('wmr-double')!!.style.display = "flex";
}

export function theNextStationIs(station: string): void {
    document.getElementById('wmr-double-top')!!.innerHTML = "The next station is";
    document.getElementById('wmr-double-bottom')!!.innerHTML = station;

    document.getElementById('wmr-footer-text')!!.innerHTML = "The next station is " + station;

    hideAllButFooter();
    document.getElementById('wmr-double')!!.style.display = "flex";
}

export function thisTrainIsFor(station: string): void {
    document.getElementById('wmr-double-top')!!.innerHTML = "This train is for";
    document.getElementById('wmr-double-bottom')!!.innerHTML = station;

    hideAllButFooter();
    document.getElementById('wmr-double')!!.style.display = "flex";
}

export function thisIsFinal(station: string): void {
    document.getElementById('wmr-double-top')!!.innerHTML = "This is";
    document.getElementById('wmr-double-bottom')!!.innerHTML = station;

    hideAllButFooter();
    document.getElementById('wmr-footer-text')!!.innerHTML = "";
    document.getElementById('wmr-double')!!.style.display = "flex";
    document.getElementById('wmr-journey-complete')!!.style.display = "flex";
}

export function connections(station: string): void {
    document.getElementById('wmr-connections-title')!!.innerHTML = station + " Connections";

    hideAllButFooter();
    document.getElementById('wmr-connections')!!.style.display = "flex";
}

export function samaritans(): void {
    hideAll();
    document.getElementById('wmr-samaritans')!!.style.display = "flex";
}

export function onTheRails(): void {
    hideAll();
    document.getElementById('wmr-ontherails')!!.style.display = "flex";
}


export function updateFooterTime(): void {
    const timeElement = document.getElementById('wmr-footer-time');
    if (!timeElement) return;

    const now: Date = new Date();

    const hours: number = now.getHours();
    const minutes: number = now.getMinutes();

    const hoursStr: string = hours < 10 ? `0${hours}` : `${hours}`;
    const minutesStr: string = minutes < 10 ? `0${minutes}` : `${minutes}`;

    const timeString: string = `${hoursStr}:${minutesStr}`;
    timeElement.textContent = timeString;
}