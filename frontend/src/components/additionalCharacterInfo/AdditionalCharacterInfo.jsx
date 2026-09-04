import React, { useEffect, useRef, useState } from "react";

import "./AdditionalCharacterInfo.css"
import { WerewolfCharacter } from "../../services/characterService";

const infoOptions = {
    fomor: [
        { property: 'bane', label: 'Bane' },
        { property: 'corruption', label: 'Corruption' }
    ],
    werewolf: [],
    vampire: [],
    mortal: []
}

function InfoDisplay({
    varName,
    varVal,
    onChange
}){
    const [tempVar, setTempVar] = useState(varVal);

    const textareaRef = useRef(null);

    useEffect(() => {
        if(textareaRef.current){
            textareaRef.current.style.height = '0px';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [tempVar])

    return(
        <div className="info-container">
            <label className="info-name wod-font fw-bold">{varName.label}: </label>
            <textarea
                ref={textareaRef}
                className="text-light input-transparent wod-font textarea-limited"
                value={tempVar}
                name={varName.label}
                rows={1}
                onChange={(e) => {
                    setTempVar(e.target.value);
                }}
                //onBlur={() => onCharacterChanged({...character, corruption: tempC})}
                onBlur={() => onChange(varName.property, tempVar)}
                onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); }}}
            />
        </div>
    );
}

function AdditionalCharacterInfo({
    character,
    onCharacterChanged
}){ 
    const infoTags = infoOptions[character.characterType];

    function saveChanges(varName, tempVar){
        onCharacterChanged({...character, [varName]: tempVar})
    }

    return(

        <div>
            {infoTags.map(tag => (
                <InfoDisplay varName={tag} varVal={character[tag.property]} 
                    onChange={saveChanges}/>
            ))}
        </div>
        
    );
}

export default AdditionalCharacterInfo;