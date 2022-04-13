import axios from 'axios';
const DOMAIN = 'http://domain.devsapp.net';

export interface Params {
    type: string;
    user: string;
    region: string;
    service: string;
    function: string;
    token?: string;
}

function checkRs(rs: any) {
    if (rs.Status !== 'Success') {
        throw new Error(rs.Body);
    }
}

function parseParams(params: Params) {
    const parsedParams = new URLSearchParams();
    parsedParams.append('type', params.type);
    parsedParams.append('region', params.region);
    parsedParams.append('service', params.service);
    parsedParams.append('user', params.user);
    parsedParams.append('function', params.function);
    if (params.token) {
        parsedParams.append('token', params.token);
    }
    return parsedParams;
}

function getCommonHeaders() {
    return  { 'Content-Type': 'application/x-www-form-urlencoded' }
}

export async function token(params: Params) {
    const { data } = await axios.post(`${DOMAIN}/token`, parseParams(params), { headers: getCommonHeaders() });
    checkRs(data.Response);
    return data.Response;
}

export async function domain(params: Params) {
    const { data } = await axios.post(`${DOMAIN}/domain`, parseParams(params), { headers: getCommonHeaders() });
    checkRs(data.Response);
    return data.Response;
}

export async function verify(params: Params) {
    const { data } = await axios.post(`${DOMAIN}/verify`, parseParams(params), { headers: getCommonHeaders() });
    return data.Response;
}