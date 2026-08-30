import * as userApi from '../api/userClient';

export async function GetAllUsers(){
    const response = userApi.getAllUsers();

    return response.data;
}

export async function GetUserById(id){
    const response = userApi.getUserById(id);

    return response.data;
}