import { useEffect, useRef, useState } from "react";

import './SessionsLayout.css'

function SelectSession(sessionId){
    console.log(`Routing to session id ${sessionId}`);
}

function SessionsLayout({ SessionsArray, onSessionSelect }){

    const scrollRef = useRef(null);

    const handleScroll = (e) => {
        const scroll = e.currentTarget;
        const grid = scroll.querySelector(".sessions-grid");
        const card = scroll.querySelector(".session-card");

        if (!card) return;

        const cardHeight = card.getBoundingClientRect().height;

        const styles = getComputedStyle(grid);

        const gap = parseFloat(styles.rowGap);
        const paddingTop = parseFloat(styles.paddingTop);

        const rowPitch = cardHeight + gap;

        // Each row moves 3vh horizontally
        const rowOffsetX = window.innerHeight * 0.048;
        //const rowOffsetX = window.innerHeight * 0.040;

        const diagonalSlope = rowOffsetX / rowPitch;

        // Vertical coordinate of the viewport center
        // relative to the grid.
        const centerY =
            scroll.scrollTop +
            scroll.clientHeight / 2 -
            paddingTop;

        const diagonalX = centerY * diagonalSlope;

        scroll.style.setProperty(
            "--diagonal-x",
            `${diagonalX}px`
        );
    };

    useEffect(() => {
        if(scrollRef.current){
            handleScroll({ currentTarget: scrollRef.current });
        }
    }, [SessionsArray]);

    return(
        <div className={`sessions-content `}>
            <div className="d-flex sessions-header">
                <h1 className="wod-heading text-danger">Your Sessions</h1>
            </div>
            
            <div className="sessions-scroll" ref={scrollRef} onScroll={handleScroll}>
                <div className="sessions-grid">
                    {Array.from(
                        { length: Math.ceil(SessionsArray.length / 2) },
                        (_, rowIndex) => (
                            <div
                                className="session-row"
                                key={rowIndex}
                                style={{
                                    "--row": rowIndex,
                                }}
                            >
                                {SessionsArray
                                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                                    .map((session) => (
                                        <div
                                            className="session-card btn btn-outline-danger"
                                            key={session.id}
                                            onClick={() => onSessionSelect(session.id)}
                                        >
                                            <img
                                                src={new URL(`../assets/images/${session.imageName}`, import.meta.url)}
                                                className="session-card-image"
                                                alt={session.name}
                                            />

                                            <div className="session-card-title wod-heading">
                                                {session.name}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default SessionsLayout;