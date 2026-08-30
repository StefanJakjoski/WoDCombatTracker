import axiosClient from "./axiosClient";

export function register(request){
    return axiosClient.post('/auth/register', request);
}

export function login(request){
    return axiosClient.post('/auth/login', request);
}