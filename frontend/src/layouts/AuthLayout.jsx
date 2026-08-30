import { Link } from 'react-router-dom';
import './AuthLayout.css';

function AuthLayout({ title, backgroundImage, children }) {
    return (
        <main
            className="auth-page"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <section className="auth-panel">
                <div className="auth-content">

                    <Link
                        to="/"
                        className="text-decoration-none text-secondary"
                    >
                        Back
                    </Link>

                    <h1 className="h2 fw-bold mt-4 mb-4">
                        {title}
                    </h1>

                    {children}

                </div>
            </section>
        </main>
    );
}

export default AuthLayout;