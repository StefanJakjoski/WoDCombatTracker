import { useEffect, useState } from "react";
import clawmark from '../../assets/images/clawmark.png'
import background from '../../assets/images/background2.jpg'

import './Sessions.css'
import SessionsLayout from "../../layouts/SessionsLayout";
import { useNavigate } from "react-router-dom";
import { createSession, getAllSessions } from "../../services/sessionService";

var templateSessions = [
    {
        id: 0,
        name: "New Session",
        image: "https://picsum.photos/500/300?random=0",
    },
    {
        id: 1,
        name: "Encounter 1",
        image: "https://picsum.photos/500/300?random=1",
    },
    {
        id: 2,
        name: "Encounter 2",
        image: "https://picsum.photos/500/300?random=2",
    },
    {
        id: 3,
        name: "Test Encounter",
        image: "https://picsum.photos/500/300?random=3",
    },
    {
        id: 4,
        name: "Technocracy Moon Base",
        image: "https://picsum.photos/500/300?random=4",
    },
    {
        id: 5,
        name: "Evening Jackoff Session",
        image: "https://picsum.photos/500/300?random=5",
    },
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