import type { RequestHandler } from './$types';
import { rtt_user, rtt_password } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
    const { crsCode } = params;

    const headers: Headers = new Headers();
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('Authorization', 'Basic ' + btoa(rtt_user + ":" + rtt_password));

    console.log(`https://api.rtt.io/api/v1/json/search/${crsCode}`);
    const response = await fetch(`https://api.rtt.io/api/v1/json/search/${crsCode}`, {
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