import { Link } from 'react-router-dom';
import './Home.css'

function Home(){
    return(
        <main className="home-page">
            <div className="home-overlay" />

            <div className="container position-relative z-1">
                <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center text-white">
                    <h1 className="display-1 fw-bold home-title">
                        YOUR MASSIVE TITLE
                    </h1>

                    <div className="d-flex flex-column flex-sm-row gap-3 mt-5">
                        <Link to="/signup" className="btn btn-primary btn-lg px-5">
                            Sign Up
                        </Link>

                        <Link to="/login" className="btn btn-outline-light btn-lg px-5">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home;