import { useNavigate } from "react-router-dom";

function NotLoggedInDisplay(){
    const navigate = useNavigate();

    return(
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
            <div className="text-danger fs-1 fw-bold wod-heading error-text">
                Not logged in.
            </div>
            <div className="error-text">
                <button className="wod-button btn text-danger error-text m-2"
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
                <button className="wod-button btn text-danger error-text m-2"
                    onClick={() => navigate('/signup')}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export default NotLoggedInDisplay;