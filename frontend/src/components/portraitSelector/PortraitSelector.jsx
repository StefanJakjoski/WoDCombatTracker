import { useState } from "react";

import "./PortraitSelector.css";

import wwplaceholder from "../../assets/icons/wwplaceholder.png";

// Automatically discover all portrait images in this directory
const portraitFiles = import.meta.glob(
    "../../assets/icons/*.{png,jpg,jpeg,webp}",
    {
        eager: true,
        query: "?url",
        import: "default",
    }
);

// Convert the discovered files into an array
const portraits = Object.entries(portraitFiles).map(
    ([path, url]) => ({
        name: path.split("/").pop(),
        url,
    })
);

function PortraitSelector({ character, onCharacterChanged }) {

    const [isOpen, setIsOpen] = useState(false);

    const currentPortrait = portraits.find(
        (portrait) => portrait.name === (character.portraitName ?? 'wwplaceholder.png')
    );

    const handlePortraitSelect = (portraitName) => {

        const updatedCharacter = {
            ...character,
            portraitName: portraitName,
        };

        onCharacterChanged(updatedCharacter);
        setIsOpen(false);
    };

    return (
        <>
            {/* Current portrait */}
            <div
                className="portrait-image"
                onClick={() => setIsOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsOpen(true);
                    }
                }}
            >
                <img
                    src={currentPortrait?.url ?? wwplaceholder}
                    alt={character.name}
                />

                <div className="portrait-fade" />
            </div>


            {/* Portrait selector */}
            {isOpen && (
                <div
                    className="portrait-selector-overlay"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="portrait-selector"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="portrait-selector-header">
                            <h2 className="wod-heading">
                                Select Portrait
                            </h2>

                            <button
                                className="btn wod-button"
                                onClick={() => setIsOpen(false)}
                            >
                                X
                            </button>
                        </div>


                        <div className="portrait-grid">

                            {portraits.map((portrait) => (

                                <button
                                    key={portrait.name}
                                    className={`portrait-option ${
                                        character.portraitName === portrait.name
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handlePortraitSelect(portrait.name)
                                    }
                                >
                                    <img
                                        src={portrait.url}
                                        alt={portrait.name}
                                    />
                                </button>

                            ))}

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default PortraitSelector;
