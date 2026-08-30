import axiosClient from './axiosClient';

export function getAllCharacters(){
    return axiosClient.get('/character');
}

export function getCharacterById(id){
    return axiosClient.get(`/character/${id}`);
}

export function getCharactersBySessionId(id){
    return axiosClient.get(`/character/session/${id}`);
}

export function createWerewolfCharacter(request){
    return axiosClient.post('/character/werewolf', request);
}

export function createMortalCharacter(request){
    return axiosClient.post('/character/mortal', request);
}

export function updateCharacterById(id, request){
    return axiosClient.put(`/character/${id}`, request);
}

export function deleteCharacterById(id){
    return axiosClient.delete(`/character/${id}`);
}

export function deleteCharactersBySessionId(id){
    return axiosClient.delete(`/character/session/${id}`);
}

export function dealDamageToCharacterById(id, request){
    return axiosClient.post(`/character/${id}/damage`, request);
}

export function healDamageToCharacterById(id, request){
    return axiosClient.post(`/character/${id}/heal`, request);
}