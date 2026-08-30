
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Signup from '../pages/Signup/Signup';
import Sessions from '../pages/Sessions/Sessions';
import Encounter from '../pages/Encounter/Encounter';

function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                 element={<Home />}      />
                <Route path="/login"            element={<Login />}     />
                <Route path="/signup"           element={<Signup />}    />
                <Route path="/sessions"         element={<Sessions />}  />
                <Route path="/sessions/:id"     element={<Encounter />}  />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;