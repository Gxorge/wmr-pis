import type { RequestHandler } from './$types';
import { rtt_user, rtt_password } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
    const { serviceUid } = params;

    const headers: Headers = new Headers();
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('Authorization', 'Basic ' + btoa(rtt_user + ":" + rtt_password));

    const dateObj = new Date();
    const month   = ((dateObj.getUTCMonth() + 1) < 11 ? "0" + (dateObj.getUTCMonth() + 1) : "" + (dateObj.getUTCMonth() + 1)); 
    const day     = dateObj.getUTCDate();
    const year    = dateObj.getUTCFullYear();
    console.log(`https://api.rtt.io/api/v1/json/service/${serviceUid}/${year}/${month}/${day}`);
    const response = await fetch(`https://api.rtt.io/api/v1/json/service/${serviceUid}/${year}/${month}/${day}`, {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();
    console.log("rtt called");
    
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}  