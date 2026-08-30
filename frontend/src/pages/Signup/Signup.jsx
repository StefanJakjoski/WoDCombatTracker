import SignupForm from "../../components/auth/SignupForm";
import AuthLayout from "../../layouts/AuthLayout";
import background2 from '../../assets/images/background2.jpg'

function Signup(){
    return (
        <AuthLayout title="Create Account" backgroundImage={background2}>  
            <SignupForm />
        </AuthLayout>
    );
}

export default Signup;