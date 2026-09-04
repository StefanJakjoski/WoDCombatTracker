import React, { useEffect, useRef, useState } from "react";
import "./Descriptor.css"

const descriptorOptions = {
    werewolf: [
        {
            property: "breed",
            label: "Breed",
            options: ["Homid", "Metis", "Lupus"]
        },
        {
            property: "auspice",
            label: "Auspice",
            options: [
                "Ragabash",
                "Theurge",
                "Philodox",
                "Galliard",
                "Ahroun"
            ]
        },
        {
            property: "tribe",
            label: "Tribe",
            options: [
                "Black Furies",
                "Wendigo",
                "Silver Fangs",
                "Bonegnawers",
                "Other"
            ]
        }
    ],

    vampire: [
        {
            property: "allegiance",
            label: "Allegiance",
            options: [
                "Camarilla",
                "Sabbat",
                "Anarch",
                "Independent"
            ]
        },
        {
            property: "clan",
            label: "Clan",
            options: [
                "Brujah",
                "Gangrel",
                "Malkavian",
                "Nosferatu",
                "Toreador",
                "Tremere",
                "Ventrue"
            ]
        }
    ],

    mortal: []
};


function DescriptorDropdown({
    value,
    options,
    placeholder = "Select",
    onChange,
    onOpenChanged
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

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
        onOpenChanged(open);
    }, [open])

    const selected = options.find(option => option === value);
    const displayValue = selected ?? placeholder;

    function handleSelect(option) {
        onChange(option);
        setOpen(false);
    }

    return (
        <div
            ref={dropdownRef}
            className={`descriptor-dropdown ${open ? "open" : ""}`}
        >
            <button
                type="button"
                className="descriptor-button text-fuzz-5 wod-font"
                onClick={() => setOpen(prev => !prev)}
            >
                {displayValue}
            </button>

            {open && (
                <div className="descriptor-menu unrounded wod-border">
                    {options.map(option => (
                        <button
                            key={option}
                            type="button"
                            className={`descriptor-option wod-font ${
                                option === value ? "selected" : ""
                            }`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}



function Descriptor({character, onCharacterChanged, onOpenChanged}) {
    if (!character)
        return null;

    const fields = descriptorOptions[character.characterType] ?? [];
    if (fields.length === 0)
        return null;

    return (
        <div className="descriptor-container">
            {fields.map((field, index) => (
                <React.Fragment key={field.property}>

                    <DescriptorDropdown
                        value={character[field.property]}
                        options={field.options}
                        placeholder={field.label}
                        onOpenChanged={onOpenChanged}
                        onChange={(value) =>
                            onCharacterChanged({
                                ...character,
                                [field.property]: value
                            })
                        }
                    />

                    {index < fields.length - 1 && (
                        <span className="descriptor-separator">
                            ◆
                        </span>
                    )}

                </React.Fragment>
            ))}
        </div>
    );
}


export default Descriptor;