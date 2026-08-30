
import LoginForm from '../../components/auth/LoginForm.jsx';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import background1 from '../../assets/images/background1.jpg'

function Login() {
    return(
        <AuthLayout title="Welcome Back" backgroundImage={background1}>
            <LoginForm />
        </AuthLayout>
    );
}

export default Login;