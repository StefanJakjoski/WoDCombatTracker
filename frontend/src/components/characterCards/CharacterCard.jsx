import React, { useEffect, useMemo, useState } from "react";

import "./CharacterCard.css";

import wwplaceholder from '../../assets/icons/wwplaceholder.png'
import Descriptor from "../descriptor/Descriptor";
import { Damage, DamageType, dealDamageToCharacterById, healDamageToCharacterById } from "../../services/characterService";

//import PortraitSelector from "./PortraitSelector";

/*
 * CharacterCombatCard
 *
 * Designed around the Storyteller / W20 combat tracker.
 *
 * Visual structure:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                                                                         X 
 * │ [portrait]  NAME                   HEALTH          RESOURCES       INI  │
 * │             Homid • Ahroun • Fianna  [A][L][L][B]   WP ●●●●○○        8  │
 * │                                      Health: 5/7    Rage ●●●●●○         │
 * │                                                     Gnosis ●●●○○        │
 * │                                                    [2L][Apply][WP][...] │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

function StatInput({statName, label, tempStats, character, setStat, onCharacterChanged}){
    const [isEditing, setIsEditing] = useState(false);

    return(
        <div className="row">
            <label className="small text-light col-6">{label}:</label>
            <input 
                type="text"
                inputMode="numeric"
                className="small text-light input-transparent input-limited stat col-auto"
                maxLength={2}
                pattern="[0-9]{0,2}"
                value={isEditing ? tempStats[statName] : character.combatStats[statName] }
                name={statName}
                onFocus={() => setIsEditing(true)}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setStat(statName, value);
                    //e.target.defaultValue = value;
                }}
                onBlur={() => {
                    const value = tempStats[statName] === "" ? 0 : Number(tempStats[statName]);
                    setStat(statName, value);
                    onCharacterChanged({...character, combatStats: {...tempStats, [statName]: value}})
                    setIsEditing(false);
                }}
                onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
            />
        </div>
    );
}

export default function CharacterCombatCard({
  character,
  combatant,

  isActive = false,

  onCharacterChanged,
  onDamage,
  onSpendResource,
  onPortraitChanged,
  onDelete,
  onInitiativeChanged
}){
    const [characterUpdating, setCharacterUpdating] = useState(false);
    const [init, setInit] = useState(true);

    const [resources, setResources] = useState([]);
    const [health, setHealth] = useState(null);
    const [tempName, setTempName] = useState(character.name ?? "Lost Soul");
    const [tempStats, setTempStats] = useState(character.combatStats ?? null);
    const [descriptorOpen, setDescriptorOpen] = useState(false);
    
    /****************************************************************
    * FUNCTIONS
    ****************************************************************/
    function initialize(){
        if(!init)
            return;

        getResources();
        getHealth();
        setInit(false);
    }

    function formatResource(data, name, color){
        const key = `${character.id}${name}`;
        return {data, name, color, key};
    }

    function getResources(){
        if(!character)
            return;

        var resourceArr = [];
        if(character.willpower){
            var r = formatResource(character.willpower, 'Willpower', 'primary');
            resourceArr.push(r);
        }

        if(character.characterType == "werewolf"){
            if(character.rage){
                var r = formatResource(character.rage, 'Rage', 'danger');
                resourceArr.push(r);
            }

            if(character.gnosis){
                var r = formatResource(character.gnosis, 'Gnosis', 'primary');
                resourceArr.push(r);
            }
        }

        setResources(resourceArr);
    }

    function getResourceClasses(resourceName){
        switch(resourceName){
            case 'Willpower':
                return 'resource-willpower';
            case 'Rage':
                return 'resource-rage';
            case 'Gnosis':
                return 'resource-gnosis';
            case 'Blood Pool':
                return 'resource-blood-pool'
            default:
                return '';
        }
    }

    function setSpecificResource(resourceName, val){
        setResources(prev => 
            prev.map(resource =>
                resource.name === resourceName
                ? {...resource, data: { ...resource.data, current: val }}
                : resource
            )
        );
    }

    function updateResourcesInCharacter(){
        resources?.forEach((resource) => {
            switch(resource.name){
                case 'Willpower':
                    character.willpower = resource.data;
                    break;
                case 'Rage':
                    character.rage = resource.data;
                    break;
                case 'Gnosis':
                    character.gnosis = resource.data;
                    break;
                case 'Blood Pool':
                    character.bloodPool = resource.data;
                    break;
            }
        });

        setCharacterUpdating(true);
    }

    function getHealth(){
        if(!character)
            return;

        if(character.health)
            setHealth(character.health);
    }

    function updateHealthInCharacter(){
        if(!character || health == null)
            return;

        onCharacterChanged({...character, health: health});
    }

    function getDamageType(level){
        switch(level){
            case 0:
                return ' ';
            case 1:
                return 'B';
            case 2:
                return 'L';
            case 3:
                return 'A';
        }

        return ' ';
    }

    function StatDots({name, value, max=10, onChange}){
        const resourceClass = getResourceClasses(name);
        return (
            <div className="stat-dots">
                {Array.from({ length: max }, (_, i) => {
                    const filled = i < value;

                    return (
                        <button
                            key={i}
                            type="button"
                            className={`stat-dot ${filled ? `filled ${resourceClass}` : ""}`}
                            onClick={() => onChange(i + 1)}
                            aria-label={`Set value to ${i + 1}`}
                        />
                    );
                })}
            </div>
        );
    }

    async function dealDamage(amount, type){
        if(type == null || amount == null || character == null)
            return;

        const id = character.id;
        var damage = new Damage(type, amount);
        const result = await dealDamageToCharacterById(id, damage);
        setHealth(result.health);
    }

    async function healDamage(amount, type){
        if(type == null || amount == null || character == null)
            return;

        const id = character.id;
        var damage = new Damage(type, amount);
        const result = await healDamageToCharacterById(id, damage);
        setHealth(result.health);
    }

    function updateCharacterInBackend(){
        if(!characterUpdating)
            return;

        onCharacterChanged({...character});
        setCharacterUpdating(false);
    }

    function updateStat(statName, value){
        setTempStats(prev => ({...prev, [statName]: value}));
        if(statName === 'baseInitiative' || statName === 'currentInitiative')
            onInitiativeChanged();
    }


    /****************************************************************
    * INITS AND HOOKS
    ****************************************************************/
    //useEffect(() => {
    //    getResources();
    //    getHealth();
    //}, [character]);
    useEffect(() => initialize(), [init]);

    useEffect(() => updateResourcesInCharacter(), [resources]);
    useEffect(() => updateCharacterInBackend(), [characterUpdating]);

    

    /****************************************************************
    * MAIN HTML RETURN
    ****************************************************************/
    return(
        <div className={`row character-row align-items-center mb-2 mt-2 
            border ${isActive ? "border-danger" : "border-warning"} unrounded text-light 
            ${descriptorOpen ? "dropdown-open" : ""}`}>

            {/*Portrait*/}
            <div className="col-1 portrait">
                <div className="portrait-image">
                    <img
                        src={wwplaceholder}
                        alt=""
                    />
                    <div className="portrait-fade" />
                </div>
            </div>

            {/*Name and Descriptor*/}
            <div className="col-4 name">
                <input
                    type="text"
                    className="fs-3 fw-bold text-light input-transparent wod-font
                        input-limited text-uppercase f-aldrich-regular my-1"
                    value={tempName}
                    name="name"
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => {onCharacterChanged({...character, name: tempName})}}
                    onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
                />

                <Descriptor character={character} onCharacterChanged={onCharacterChanged} 
                    onOpenChanged={setDescriptorOpen}/>
            </div>

            {/*Resources and Health*/}
            <div className="col-4 resources">
                {resources?.map((resource) => (
                    <div className="row">
                        <div key={resource.key} className="col-4">
                            <small>{resource.name}</small>
                        </div>
                        <div className="col-8">
                            <StatDots 
                                name={resource.name}
                                value={resource?.data.current} 
                                max={resource?.data.maximum}
                                onChange={(val) => setSpecificResource(resource?.name, val)}
                            />
                        </div>
                    </div>
                ))}

                <div className="row d-flex gap-1 mt-4">
                    <div className="col-3">
                        <label>Health</label>
                    </div>
                    {health?.levels.map((level, i) => (
                        <div className="col-1" key={`${character.id}${i}`}>
                            <label className="fw-bold health-level">
                                [ {getDamageType(level ?? 0)} ]
                            </label>
                        </div>
                    ))}
                </div>


                <div className="row g-0 mt-2">
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Bashing)}>Bashing</button>
                    </div>
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Lethal)}>Lethal</button>
                    </div>
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Aggravated)}>Aggravated</button>
                    </div>
                </div>
                <div className="row g-0">
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Bashing)}>Bashing</button>
                    </div>
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Lethal)}>Lethal</button>
                    </div>
                    <div className="col-4">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Aggravated)}>Aggravated</button>
                    </div>
                </div>
            </div>

            {/*Combat Stats*/}
            <div className="col-auto combat-stats">
                {/*
                <p className="small m-0">BI: {character.combatStats.baseInitiative}</p>
                <p className="small m-0">DO: {character.combatStats.dodge}</p>
                <p className="small m-0">SO: {character.combatStats.soak}</p>

                <p className="small m-0 mt-4">IN: {character.combatStats.currentInitiative}</p>
                <p className="small m-0">IA: {character.combatStats.isActive ? 1 : 0}</p>
                */}

                {/*
                <label className="small text-light">BI:</label>
                <input 
                    type="text"
                    inputMode="numeric"
                    className="small text-light input-transparent input-limited stat"
                    maxLength={2}
                    pattern="[0-9]{0,2}"
                    value={tempStats.baseInitiative}
                    name="baseInitiative"
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setTempStats({...tempStats, baseInitiative: value})}
                    }
                    onBlur={() => {
                        const value = tempStats.baseInitiative === "" ? 0 : Number(tempStats.baseInitiative);
                        setTempStats({...tempStats, baseInitiative: value});
                        onCharacterChanged({...character, combatStats: {...tempStats, baseInitiative: value}})}
                    }
                    onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
                />
                */}

                <StatInput statName={"baseInitiative"} label={"BI"} tempStats={tempStats} 
                    setStat={updateStat} character={character} onCharacterChanged={onCharacterChanged}/>
                <StatInput statName={"currentInitiative"} label={"CI"} tempStats={tempStats} 
                    setStat={updateStat} character={character} onCharacterChanged={onCharacterChanged}/>
                <StatInput statName={"soak"} label={"SO"} tempStats={tempStats} 
                    setStat={updateStat} character={character} onCharacterChanged={onCharacterChanged}/>
                <StatInput statName={"dodge"} label={"DO"} tempStats={tempStats} 
                    setStat={updateStat} character={character} onCharacterChanged={onCharacterChanged}/>
            </div>

            <div className="col-1">
                <div className="row g-0">
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Bashing)}>B</button>
                    </div>
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Bashing)}>B</button>
                    </div>
                </div>
                <div className="row g-0">
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Lethal)}>L</button>
                    </div>
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Lethal)}>L</button>
                    </div>
                </div>
                <div className="row g-0">
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-danger small unrounded" onClick={() => dealDamage(1, DamageType.Aggravated)}>A</button>
                    </div>
                    <div className="col-6">
                        <button className="w-100 btn btn-sm btn-outline-success small unrounded" onClick={() => healDamage(1, DamageType.Aggravated)}>A</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
