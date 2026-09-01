import * as characterApi from '../api/characterClient';

export async function getCharacterById(id){
    const response = await characterApi.getCharacterById(id);

    return response.data;
}

export async function getAllCharacters(){
    const response = await characterApi.getAllCharacters();

    return response.data;
} 

export async function getCharactersBySessionId(sessionId){
    const response = await characterApi.getCharactersBySessionId(sessionId);

    return response.data;
}

export async function createCharacter(request){
    var response;
    if(!request.type)
        return null;

    switch(request.type){
        case 'werewolf':
            response = await characterApi.createWerewolfCharacter(request);
            break;
        case 'mortal':
            response = await characterApi.createMortalCharacter(request);
            break;
        case 'fomor':
            response = await characterApi.createFomorCharacter(request);
            break;
        case 'vampire':
            response = await characterApi.createVampireCharacter(request);
            break;
        default:
            response = await characterApi.createMortalCharacter(request);
            break;
    }

    return response.data;
} 

export async function updateCharacterById(request){
    if(!request.id)
        return;

    const response = await characterApi.updateCharacterById(request.id, request);

    return response.status;
}

export async function deleteCharacterById(id){
    const response = await characterApi.deleteCharacterById(id);

    return response.status;
}

export async function deleteCharactersBySessionId(id){
    const response = await characterApi.deleteCharactersBySessionId(id);

    return response.status;
} 

export async function dealDamageToCharacterById(id, request){
    const response = await characterApi.dealDamageToCharacterById(id, request);

    return response.data;
}

export async function healDamageToCharacterById(id, request){
    const response = await characterApi.healDamageToCharacterById(id, request);

    return response.data;
}

export class WerewolfCharacter{
    constructor(
        sessionId = null,
        name = 'New Character',
        type = '',
        category = 'npc',
        willpower = 0,
        breed = '',
        auspice = '',
        tribe = '',
        rage = 0,
        gnosis = 0,
        gifts = []
    ){
        this.sessionId = sessionId;
        this.name = name;
        this.type = type;
        this.category = category;
        this.willpower = willpower;
        this.breed = breed;
        this.auspice = auspice;
        this.tribe = tribe;
        this.rage = rage;
        this.gnosis = gnosis;
        this.gifts = gifts;
    }
}

export class MortalCharacter{
    constructor(
        sessionId = null,
        name = 'New Character',
        type = '',
        category = 'npc',
        willpower = 0,
    ){
        this.sessionId = sessionId;
        this.name = name;
        this.type = type;
        this.category = category;
        this.willpower = willpower;
    }
}

export class Damage{
    constructor(
        type = DamageType.None,
        amount = 0
    ){
        this.type = type;
        this.amount = amount;
    }
}

export const DamageType = { 
    None: 0, 
    Bashing: 1, 
    Lethal: 2, 
    Aggravated: 3 
};

export const CharacterType = { 
    Werewolf: 'werewolf', 
    Mortal: 'mortal',
    Fomor: 'fomor',
    Vampire: 'vampire'
};