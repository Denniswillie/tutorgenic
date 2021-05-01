import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

export default function Auth(props) {
    props.setDisplayNavbar(false);
    useEffect(() => {
        const ac = new AbortController();
        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    window.open('/home', '_self');
                } else if (props.error) {
                    alert(props.error);
                }
            })
            .catch(err => console.log(err));
        return () => {
            ac.abort();
        }
    }, [props.error]);
    const loginFormRef = useRef();
    const registerFormRef = useRef();
    const [displayLogin, setDisplayLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [password, setPassword] = useState("");
    function displayLoginForm() {
        if (!displayLogin) {
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
        }
        setDisplayLogin(true);
        document.getElementById("login").style.left = "50px";
        document.getElementById("register").style.left = "450px";
        document.getElementById("btn").style.left = "0px";
    }

    function displayRegisterForm() {
        if (displayLogin) {
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
        }
        setDisplayLogin(false);
        document.getElementById("login").style.left = "-400px";
        document.getElementById("register").style.left = "50px";
        document.getElementById("btn").style.left = "110px";
    }

    function handleChangeEmail(event) {
        setEmail(event.target.value);
    }

    function handleChangeFirstName(event) {
        setFirstName(event.target.value);
    }

    function handleChangeLastName(event) {
        setLastName(event.target.value);
    }

    function handleChangePassword(event) {
        setPassword(event.target.value);
    }

    function handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(loginFormRef.current);
        axios({
            method: 'post',
            url: '/auth/login',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.isLoggedIn) {
                window.open('/home', '_self');
            } else {
                alert('Wrong credentials');
            }
        })
        .catch(err => console.log(err));
    }

    function handleRegister(event) {
        event.preventDefault();
        console.log('register');
        const formData = new FormData(registerFormRef.current);
        axios({
            method: 'post',
            url: '/auth/register',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                window.open('/home', '_self');
            } else {
                alert('Failed to register');
            }
        })
        .catch(err => console.log(err));
    }

    function handleSubmit(e) {
        console.log('submitted');
    }

    return <div className="hero">
        <div className="form-box">
            <h1 style={{margin: "auto"}}>Tutorgenic</h1>
            <div className="button-box">
                <div id="btn"></div>
                <button type="button" className="toggle-btn" onClick={displayLoginForm}>Log In</button>
                <button type="button" className="toggle-btn" onClick={displayRegisterForm}>Register</button>
            </div>
            <form onSubmit={handleSubmit} id="login" ref={loginFormRef} className="input-group">
                <input name="username" value={email} onChange={handleChangeEmail} type="text" className="input-field" placeholder="Enter your email"/>
                <input name="password" value={password} onChange={handleChangePassword} type="password" className="input-field" placeholder="Enter your password"/>
                <button type="submit" className="submit-btn" onClick={handleLogin}>Login</button>
                {displayLogin && <button type="button" className="submit-btn" onClick={() => {
                            window.location.href = "/auth/google";
                        }} style={{marginTop: "0.6em"}}>
                    <img 
                        src={process.env.PUBLIC_URL + '/images/google.png'} 
                        alt="google login"
                    />
                    <p style={{paddingTop:"6px"}}>Login with Google</p>
                </button>}
            </form>
            <form id="register" ref={registerFormRef} className="input-group">
                <input name="first_name" value={first_name} onChange={handleChangeFirstName} type="text" className="input-field" placeholder="Enter your first name"/>
                <input name="last_name" value={last_name} onChange={handleChangeLastName} type="text" className="input-field" placeholder="Enter your last name"/>
                <input name="username" value={email} onChange={handleChangeEmail} type="text" className="input-field" placeholder="Enter your email"/>
                <input name="password" value={password} onChange={handleChangePassword} type="password" className="input-field" placeholder="Create a password"/>
                <button type="submit" className="submit-btn" onClick={handleRegister}>Register</button>
            </form>
        </div>
    </div>
}