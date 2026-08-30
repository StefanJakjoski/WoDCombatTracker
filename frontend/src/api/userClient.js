import axiosClient from './axiosClient';

export function getAllUsers(){
    return axiosClient.get('/user');
}

export function getUserById(id){
    return axiosClient.get(`/user/${id}`);
}