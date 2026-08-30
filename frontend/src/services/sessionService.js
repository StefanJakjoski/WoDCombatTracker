import * as sessionApi from '../api/sessionClient';

export async function getAllSessions(){
    const response = await sessionApi.getAllSessions();

    return response.data;
}

export async function getSessionById(id){
    const response = await sessionApi.getSessionById(id);

    return response.data;
}

export async function createSession(name, allowedUserIds){
    const response = await sessionApi.createSession({ name, allowedUserIds });

    return response.data;
}

export async function updateSessionById(id, request){
    const response = await sessionApi.updateSessionById(id, request);

    return response.data;
}

export async function deleteSessionById(id){
    const response = await sessionApi.deleteSessionById(id);

    return response.status;
}