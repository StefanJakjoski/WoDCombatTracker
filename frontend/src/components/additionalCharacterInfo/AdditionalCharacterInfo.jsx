import React, { useEffect, useRef, useState } from "react";

import "./AdditionalCharacterInfo.css"
import { WerewolfCharacter } from "../../services/characterService";

const infoOptions = {
    fomor: [
        //{ property: 'bane', label: 'Bane', isList: false },
        { property: 'powers', label: 'Powers', isList: true },
        //{ property: 'corruption', label: 'Corruption', isList: false },
    ],
    werewolf: [
        { property: 'gifts', label: 'Gifts', isList: true },
    ],
    vampire: [
        { property: 'powers', label: 'Powers', isList: true },
    ],
    mortal: []
}

function InfoDisplay({
    varName,
    varVal,
    onChange
}){
    const [tempVar, setTempVar] = useState(varVal);
    const [open, setOpen] = useState(false);
    const [newVar, setNewVar] = useState('');

    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);

    function appendValue(val){
        if(!varName.isList)
            return;

        setTempVar(prev => [...prev].push(val));
    }

    function deleteValue(deletedVal){
        if(!varName.isList)
            return;

        var newList = [];
        tempVar.map(val => {
            if(val != deletedVal)
                newList.push(val);
        });

        //console.log(newList);
        setTempVar(prev => [...prev].filter(val => val != deletedVal));
    }

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(textareaRef.current){
            textareaRef.current.style.height = '0px';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        if(varName.isList){
            onChange(varName.property, tempVar)
        }
    }, [tempVar])

    return(
        <div className="info-container">
            {!varName.isList && (
                <div>
                    <label className="info-name wod-font fw-bold">{varName.label}: </label>
                    <textarea
                        ref={textareaRef}
                        className="text-light input-transparent w-100 wod-font textarea-limited"
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
            )}

            {varName.isList && tempVar && (
                <div className="info-list-container">
                    <label className="info-name wod-font fw-bold">{varName.label}: </label>
                    {tempVar.map((value, index) => (
                        <React.Fragment key={value}>
                            <button className="info-list-entry wod-font"
                                onClick={() => deleteValue(value)}>
                                {value}
                            </button>

                            <span className="descriptor-separator">
                                ◆
                            </span>
                        </React.Fragment>
                    ))}

                    <div 
                        className={`info-list-add ${open ? "open" : ""}`} 
                        ref={dropdownRef}
                    >
                        {!open && (
                            <button 
                                className='info-list-button wod-font'
                                onClick={() => setOpen(prev => !prev)}
                            >
                                Add Entry
                            </button>
                        )}

                        {open && (
                            <div className="">
                                <input
                                    className="text-light input-transparent wod-font
                                        input-limited my-1"
                                    placeholder="New entry..."
                                    value={newVar}
                                    onChange={(e) => setNewVar(e.target.value)}
                                    onBlur={() => { 
                                        setTempVar(prev => [...prev, newVar]);
                                        setNewVar('');
                                        setOpen(false);
                                    }}
                                    onKeyDown={(e) => { if(e.key === "Enter"){ e.currentTarget.blur(); } }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
}

function AdditionalCharacterInfo({
    character,
    onCharacterChanged
}){ 
    var infoTags = infoOptions[character.characterType];

    function saveChanges(varName, tempVar){
        onCharacterChanged({...character, [varName]: tempVar});
        infoTags = infoOptions[character.characterType];
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