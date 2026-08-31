import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteSessionById, getSessionById, updateSessionById } from "../../services/sessionService";
import { CharacterType, createCharacter, deleteCharacterById, deleteCharactersBySessionId, getCharactersBySessionId, updateCharacterById } from "../../services/characterService";
import CharacterCombatCard from "../../components/characterCards/CharacterCard";

import "./Encounter.css"

/*
Phase description: 0 - initiative roll/random assignment, 1 - action declaration, 2 - taking actions 
*/

function TurnDescriptor({isActive, phase, assignInit, character, randomizeInitiative}){
    var descriptor = ''
    switch(phase % 3){
        case 0:
            descriptor = randomizeInitiative ? `Total rolled: ${character.combatStats.currentInitiative}` 
                : 'Assign total initiative \n(or leave empty for random roll)';
            break;
        case 1:
            descriptor = 'To declare action.';
            break;
        case 2:
            descriptor = 'To take action.';
            break;
        default:
            descriptor = 'Error';
            break
    }

    //if(!isActive)
    //    descriptor='';

    var currentInitiative = character.combatStats.currentInitiative;
    const showDescriptor = isActive || (randomizeInitiative && phase % 3 == 0);

    return(
        <div className={`text-light m-0 border border-danger p-2 rounded bg-black turn-descriptor
            ${showDescriptor ? 'active' : 'inactive'}`}>
                {descriptor}
                {phase%3 == 0 && !randomizeInitiative && (
                    <input 
                        type="text"
                        inputMode="numeric"
                        className="small text-light input-transparent input-limited stat col-auto"
                        maxLength={2}
                        pattern="[0-9]{0,2}"
                        defaultValue={currentInitiative}
                        name="currentInitiative"
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                            currentInitiative = value;
                        }}
                        onBlur={(e) => {
                            const value = currentInitiative === "" ? (character.combatStats.baseInitiative + RollD10()) : Number(currentInitiative);
                            assignInit(character, value);
                        }}
                        onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
                    />
                )}
        </div>
    )   
}


function RollD10(){
    return Math.floor(Math.random() * 10) + 1;
}

function Encounter(){
    const { id } = useParams();

    const navigate = useNavigate();

    //for handling
    const [updatingSession, setUpdatingSession] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [charactersSorted, setCharactersSorted] = useState(true);
    const [buttonEnabled, setButtonEnabled] = useState(true);

    //title
    const [tempTitle, setTempTitle] = useState('Encounter');

    //for turns
    const [adjustingTurn, setAdjustingTurn] = useState(false);
    const [turn, setTurn] = useState(0);
    const [phase, setPhase] = useState(0);
    const [handlingPhase, setHandlingPhase] = useState(false);
    const [randomizeInitiative, setRandomizeInitiative] = useState(true);

    //for deletion
    const [sessionMarkedForDeletion, setSessionMarkedForDeletion] = useState(false);
    const [charactersDeleted, setCharactersDeleted] = useState(false);
    const [sessionDeleted, setSessionDeleted] = useState(false);

    /****************************************************************
    * LOCAL FUNCTIONS
    ****************************************************************/
    async function fetchSession(id){
        if(id == null)
            return;

        const response = await getSessionById(id);
        if(response == null || response.status == 404){
            console.log(`Session with ID ${id} not found`);
            return;
        }
        
        //currentSession = response.data;
        setCurrentSession(response);
        setTempTitle(response.name ?? 'Encounter');
    }

    function updateSession(session = currentSession){
        setCurrentSession(session);
        setUpdatingSession(true);
    }

    function updateSessionInBackend(){
        if(!updatingSession || id == null)
            return;

        updateSessionById(id, currentSession);
        setUpdatingSession(false);
    }

    async function fetchCharactersBySessionId(sessionId){
        if(sessionId == null)
            return;

        const response = await getCharactersBySessionId(sessionId);
        if(response == null || response.status == 204){
            console.log(`Session ${sessionId} contains no characters`);
            return;
        }
        
        //currentSession = response.data;
        setCharacters(response);
        setCharactersSorted(false);
    }

    async function deleteAllCharacters(sessionId){
        if(sessionId == null)
            return;

        //add character deletion call logic
        const response = await deleteCharactersBySessionId(sessionId);
        if(response == 401){
            console.log('Unauthorized user');
            return;
        }
        
        //currentSession = response.data;
        setCharactersDeleted(true);
        setCharacters([]);
    }

    async function deleteSession(sessionId){
        if(sessionId == null || !charactersDeleted)
            return;

        //add character deletion call logic
        const response = await deleteSessionById(sessionId);
        if(response == 401){
            console.log('Unauthorized user');
            return;
        }
        
        //currentSession = response.data;
        setSessionDeleted(true);
    }

    async function createNewCharacter(request){
        console.log(request);
        if(request == null)
            return;

        const response = await createCharacter(request);
        console.log('From backend', response);
        if(response == null)
            return;

        const updatedResponse = { ...response, type: response.characterType }
        console.log('updated response', updatedResponse);
        
        //currentSession = response.data;
        setCharacters(previousCharacters => [...previousCharacters, updatedResponse]);
        setCharactersSorted(false);
    }

    async function updateCharacterInBackend(updatedCharacter){
        //console.log(updatedCharacter);
        if(updatedCharacter == null || updatedCharacter.id == null)
            return;

        const response = await updateCharacterById(updatedCharacter);
        if(response == 404)
            console.log('Character not found');
    }

    function sortCharacters(){
        //if(charactersSorted || characters.length == 0)
        //    return;


        if(phase % 3 == 0 || phase % 3 == 1)
            setCharacters(characters.sort((a, b) => 
                (a.combatStats.currentInitiative - b.combatStats.currentInitiative) 
                + (a.combatStats.currentInitiative - b.combatStats.currentInitiative == 0)
                * (a.combatStats.baseInitiative - b.combatStats.baseInitiative)));
        else
            setCharacters(characters.sort((a, b) => 
                (b.combatStats.currentInitiative - a.combatStats.currentInitiative) 
                + (b.combatStats.currentInitiative - a.combatStats.currentInitiative == 0)
                * (b.combatStats.baseInitiative - a.combatStats.baseInitiative)));

        //characters[0] = {...characters[0], combatStats: {...characters[0].combatStats, isActive: true}};
        setCharactersSorted(true);
        setAdjustingTurn(true);
    }

    function nextTurn(){
        if(adjustingTurn)
            return;

        if(characters.length == 0){
            setTurn(0);
            setAdjustingTurn(true);
            return;
        }
        
        if(turn >= characters.length){
            console.log('next turn');
            setPhase(prev => prev + 1);
            setHandlingPhase(true);
            setTurn(0);
            //setCharactersSorted(false);
        }

        setAdjustingTurn(true);
    }

    function handlePhase(){
        if(phase%3 == 0 && randomizeInitiative){
            setButtonEnabled(false);
            setCharacters(prev => prev.map(c => {
                const newInitiative = c.combatStats.baseInitiative + RollD10();
                const updatedCharacter = {...c, combatStats: {...c.combatStats, currentInitiative: newInitiative}}

                updateCharacterInBackend(updatedCharacter);
                return updatedCharacter;
            }));

            //console.log('handle phase');
            setTimeout(() => {
                setPhase(prev => prev + 1);
                setButtonEnabled(true);
            }, 3000)
            
            //setTurn(0);
        }

        setHandlingPhase(false);
    }

    function adjustActiveStatus(){
        if(!adjustingTurn)
            return;

        setCharacters(prev => prev.map((character, i) => 
            i == turn 
            ? {...character, combatStats: {...character.combatStats, isActive: true}}
            : {...character, combatStats: {...character.combatStats, isActive: false}}
        ));
        
        setAdjustingTurn(false);
    }

    async function deleteCharacter(id){
        const response = await deleteCharacterById(id);

        setCharacters(prev => {
            const deletedIndex = prev.findIndex(character => character.id === id);
            const activeIndex = prev.findIndex(character => character.combatStats.isActive == true);
            if(deletedIndex == -1)
                return prev;

            const newCharacters = prev.filter(character => character.id !== id);
            const newActiveIndex = (deletedIndex <= activeIndex) ? Math.max(0, activeIndex - 1) : activeIndex;

            console.log(`activeIndex: ${activeIndex}, deletedIndex: ${deletedIndex}, newActiveIndex: ${newActiveIndex}`);

            return newCharacters.map((character, i) => ({
                ...character, combatStats: {...character.combatStats, isActive: i == newActiveIndex }
            }));
        });
    }

    function assignInit(character, value){
        var indexedCharacter = characters.find(c => c.id == character.id);
        const updatedCharacter = {...indexedCharacter, combatStats: {...indexedCharacter.combatStats, currentInitiative: value}}
        setCharacters(prev => prev.map(c => {
            if(c.id == character.id){
                return updatedCharacter;
            }

            return c;
        }));

        //console.log(updatedCharacter);
        if(updatedCharacter != undefined)
            updateCharacterInBackend(updatedCharacter);
    }
    
    
    /****************************************************************
    * CHARACTER CARD FUNCTIONS
    ****************************************************************/

    function onCharacterChanged(updatedCharacter){
        setCharacters(prev =>
            prev.map(character =>
                character.id == updatedCharacter.id
                ? updatedCharacter
                : character
            )
        )

        updateCharacterInBackend(updatedCharacter);
    }

    function onInitiativeChanged(){
        setCharactersSorted(false);
    }

    /****************************************************************
    * HOOKS AND DEBUGGING
    ****************************************************************/
    useEffect(() => {       //id and init
        fetchSession(id);
        fetchCharactersBySessionId(id);
        setHandlingPhase(true);
    }, [id]);

    useEffect(() => sortCharacters(), [charactersSorted, phase])

    useEffect(() => handlePhase(), [phase]);

    useEffect(() => {
        nextTurn();
        adjustActiveStatus();
    }, [turn])


    useEffect(() => adjustActiveStatus(), [adjustingTurn])
    useEffect(() => updateSessionInBackend(), [updatingSession]);

    //session deletion pipeline
    //useEffect(() => deleteAllCharacters(id), [sessionMarkedForDeletion]);
    //useEffect(() => deleteSession(id), [charactersDeleted]);
    //useEffect(() => navigate('/sessions'), [sessionDeleted]);

    //debugging
    //useEffect(() => console.log(currentSession), [currentSession]);
    //useEffect(() => console.log(characters), [characters]);
    //useEffect(() => console.log('phase transition'), [phase]);


    /****************************************************************
    * HTML AND RETURN
    ****************************************************************/
    return(
        <main className="encounter-page">
            <div className="encounter-title">
                <input
                    type="text"
                    className="fs-3 fw-bold text-light input-transparent 
                        input-limited text-uppercase f-aldrich-regular my-1"
                    value={tempTitle}
                    name="name"
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => {updateSession({...currentSession, name: tempTitle})}}
                    onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
                />
            </div>

            <h1 className="encounter-title">{ id ? id : "Hello" }</h1>
            <button 
                className="btn btn-primary" 
                onClick={() => createNewCharacter({
                    sessionId: id, type: CharacterType.Werewolf,
                    rage: 5, gnosis: 5, willpower: 5, name: "Lost Soul",
                    breed: 'Homid', auspice: 'Ahroun', tribe: 'Bonegnawers',
                    soak: 5, initiative: 5, dodge: 9,
                    gifts: ['small penis', 'medium penis', 'large penis']
                })}
            >
                CREATE WEREWOLF TEST
            </button>

            <button 
                className="btn btn-primary" 
                onClick={() => createNewCharacter({
                    sessionId: id, type: CharacterType.Mortal,
                    willpower: 10, name: "Lost Soul"
                })}
            >
                CREATE MORTAL TEST
            </button>

            <button 
                className="btn btn-danger" 
                onClick={() => deleteAllCharacters(id)}
            >
                Delete all characters
            </button>

            <button 
                className="btn btn-outline-primary" 
                onClick={() => setTurn(turn+1)}
                disabled={!buttonEnabled}
            >
                Turn {turn}
            </button>

            <label className="small text-light">
                <input
                    type="checkbox"
                    checked={randomizeInitiative}
                    onChange={(e) => setRandomizeInitiative(e.target.checked)}
                />
                Randomize Initiative
            </label>


            <div className="m-4">
                {characters.map((character) => (
                    <div className="d-flex" key={character.id}>
                        <div className="">
                            <CharacterCombatCard 
                                character={character}                                
                                onCharacterChanged={onCharacterChanged}
                                onInitiativeChanged={onInitiativeChanged}
                                isActive={character.combatStats.isActive ?? false}
                            />
                        </div>

                        <button className="btn btn-small btn-outline-danger text-danger unrounded m-2"
                            onClick={() => deleteCharacter(character.id)}>
                            X
                        </button>

                        <div className="p-4 d-flex align-items-center">
                            <TurnDescriptor isActive={character.combatStats.isActive ?? false} phase={phase}
                                assignInit={assignInit} character={character} randomizeInitiative={randomizeInitiative}/>
                        </div>
                    </div>
                ))}
            </div>
            
        </main>
    );
}

export default Encounter;