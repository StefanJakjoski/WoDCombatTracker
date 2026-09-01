import { useEffect, useState } from "react";
import clawmark from '../../assets/icons/clawmark.png'
import background from '../../assets/images/background2.jpg'

import './Sessions.css'
import SessionsLayout from "../../layouts/SessionsLayout";
import { useNavigate } from "react-router-dom";
import { createSession, getAllSessions } from "../../services/sessionService";

var templateSessions = [
    {
        id: 0,
        name: "Create New Session",
        imageName: "background0.jpg",
    }
];


function Sessions(){

    /*
    for(var i = 6; i < 30; i++){
        templateSessions.push({id: i, title: "TEST" });
    }
    */
   
    

    const [started, setStarted] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [sessions, setSessions] = useState([]);

    const navigate = useNavigate();
    const animationDelayMs = 500;


    /****************************************************************
    * FUNCTIONS
    ****************************************************************/
    async function SelectSession(sessionId){
        //console.log(`Session id ${sessionId}`);
        if(sessionId == 0){
            const session = await createSession('Encounter', []);
            const id = session.session?.id || session.id;
            navigate(`/sessions/${id}`);
        }else{
            navigate(`/sessions/${sessionId}`);
        }
    }


    /****************************************************************
    * HOOKS AND DEBUGGING
    ****************************************************************/
    useEffect(() => {
        const timer = setTimeout(() => {
            setStarted(true);
        }, animationDelayMs);

        async function fetchSessions(){
            const sessions = await getAllSessions();
            //console.log(sessions);
            setSessions(sessions);
        }

        fetchSessions();
    }, []);

    const sessionsArray = [
        ...templateSessions,
        ...sessions
    ];


    /****************************************************************
    * HTML AND RETURN
    ****************************************************************/
    return(
        <main className="sessions-page"
            style={{ backgroundImage: `url(${background})`}}>
            <div className="bars">
                <div className="session-bar session-bar-left" />
                <div className="session-bar session-bar-right" />
            </div>

            {started && (
                <SessionsLayout SessionsArray={sessionsArray} onSessionSelect={SelectSession} />
            )}
            

        </main>
    );
}

export default Sessions;