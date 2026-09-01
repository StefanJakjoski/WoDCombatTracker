import axiosClient from './axiosClient';

export function getAllSessions(){
    return axiosClient.get('/session');
}

export function getSessionById(id){
    return axiosClient.get(`/session/${id}`);
}

export function getSessionByUserId(){
    return axiosClient.get(`/session/user`);
}

export function createSession(request){
    return axiosClient.post('/session', request);
}

export function updateSessionById(id, request){
    return axiosClient.put(`/session/${id}`, request);
}

export function deleteSessionById(id){
    return axiosClient.delete(`/session/${id}`,);
}