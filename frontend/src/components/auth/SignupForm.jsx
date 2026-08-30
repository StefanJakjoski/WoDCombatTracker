import { useState } from "react";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";


function SignupForm(){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event){
        event.preventDefault();

        if(password !== confirmPassword){
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError('');
        setLoading(true);

        try{
            const response = await register(username, email, password);
            console.log('Registration successful', response);

            navigate('/login');
        }catch(error){
            setError( error.response?.data?.message || error.message || 'Registration failed' );
        }finally{
            setLoading(false);
        }
    }

    function setConfirmPasswordChange(event){
        const val = event.target.value;

        setConfirmPassword(val);
        if(val && val !== password){
            setPasswordError('Passwords do not match');
        }else{
            setPasswordError('');
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="signup-name" className="form-label">
                    Name
                </label>

                <input
                    id="signup-name"
                    type="text"
                    className="form-control form-control-lg unrounded"
                    placeholder="Your name"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="signup-email" className="form-label">
                    Email address
                </label>

                <input
                    id="signup-email"
                    type="email"
                    className="form-control form-control-lg unrounded"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="signup-password" className="form-label">
                    Password
                </label>

                <input
                    id="signup-password"
                    type="password"
                    className="form-control form-control-lg unrounded"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="signup-confirm-password" className="form-label">
                    Password
                </label>

                <input
                    id="signup-confirm-password"
                    type="password"
                    className={`form-control form-control-lg unrounded
                        ${passwordError ? 'is-invalid' : ''}`}
                    placeholder="Create a password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPasswordChange(event)}
                    required
                />

                {passwordError && (
                    <div className="invalid-feedback">
                        {passwordError}
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-warning btn-lg w-100 unrounded"
                disabled={ !password || !confirmPassword || password !== confirmPassword || loading }>
                Create Account
            </button>
        </form>
    );
}

export default SignupForm;