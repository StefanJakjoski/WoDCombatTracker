import * as authApi from '../api/authClient.js';

const TOKEN_KEY = 'auth_token';

export async function register(username, email, password){
    const response = await authApi.register({ username, email, password });

    return response.data;
}

export async function login(email, password){
    const response = await authApi.login({ email, password });

    setToken(response.data.token);
    return response.data;
}

export function logout(){
    removeToken();
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}