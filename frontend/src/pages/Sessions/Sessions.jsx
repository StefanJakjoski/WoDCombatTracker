import { useEffect, useState } from "react";
import clawmark from '../../assets/icons/clawmark.png'
import background from '../../assets/images/background2.jpg'

import './Sessions.css'
import SessionsLayout from "../../layouts/SessionsLayout";
import { useNavigate } from "react-router-dom";
import { createSession, getAllSessions, getSessionByUserId } from "../../services/sessionService";
import { getToken, setToken } from "../../services/authService";
import NotLoggedInDisplay from "../../components/notLoggedIn/NotLoggedInDisplay";

var templateSessions = [
    {
        id: 0,
        name: "Create New Session",
        imageName: "background0.jpg",
    }
];


function Sessions(){

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

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
        const token = getToken();
        console.log(token);
        if(token != null){
            setToken(token);
            setIsLoggedIn(true);
        }    
    }, [])

    useEffect(() => {
        if(token == null)
            return;

        const timer = setTimeout(() => {
            setStarted(true);
        }, animationDelayMs);

        async function fetchSessions(){
            const sessions = await getSessionByUserId();
            //console.log(sessions);
            setSessions(sessions);
        }

        fetchSessions();
    }, [token]);

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

            {(token == null) && (
                <NotLoggedInDisplay />
            )}
            

        </main>
    );
}

export default Sessions;