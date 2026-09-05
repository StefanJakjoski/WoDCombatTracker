import { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function LoginForm(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event){
        event.preventDefault();

        setError('');
        setLoading(true);

        try{
            const response = await login(email, password);
            
            console.log('Login successful');
            navigate('/sessions', {
                state: { fromLogin: true }
            });
        }catch(error){
            setError( error.response?.data?.message || error.message || 'Login failed' );
        }finally{
            setLoading(false);
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div className="mb-3 wod-font">
                <label htmlFor="login-email" className="form-label">
                    Email Address
                </label>

                <input 
                    id="login-email"
                    type="email"
                    className="form-control form-control-lg unrounded"
                    placeholder="email@handle.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>

            <div className="mb-4 wod-font">
                <label htmlFor="login-password" className="form-label">
                    Password
                </label>

                <input 
                    id="login-password"
                    type="password"
                    className="form-control form-control-lg unrounded"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>

            <button type="submit" className="btn wod-button text-danger btn-lg w-100 unrounded" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

export default LoginForm;