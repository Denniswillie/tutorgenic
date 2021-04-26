import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

export default function Auth() {
    useEffect(() => {
        const ac = new AbortController();
        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    window.open('/home', '_self');
                }
            })
            .catch(err => console.log(err));
        return () => {
            ac.abort();
        }
    }, []);
    const loginFormRef = useRef();
    const registerFormRef = useRef();
    const [displayLogin, setDisplayLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    function displayLoginForm() {
        if (!displayLogin) {
            setUsername("");
            setPassword("");
            setFullName("");
        }
        setDisplayLogin(true);
        document.getElementById("login").style.left = "50px";
        document.getElementById("register").style.left = "450px";
        document.getElementById("btn").style.left = "0px";
    }

    function displayRegisterForm() {
        if (displayLogin) {
            setUsername("");
            setPassword("");
            setFullName("");
        }
        setDisplayLogin(false);
        document.getElementById("login").style.left = "-400px";
        document.getElementById("register").style.left = "50px";
        document.getElementById("btn").style.left = "110px";
    }

    function handleChangeUsername(event) {
        setUsername(event.target.value);
    }

    function handleChangePassword(event) {
        setPassword(event.target.value);
    }

    function handleChangeFullName(event) {
        setFullName(event.target.value);
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

    return <div className="hero">
        <div className="form-box">
            <h2 style={{margin: "auto"}}>Tutorgenic</h2>
            <div className="button-box">
                <div id="btn"></div>
                <button type="button" className="toggle-btn" onClick={displayLoginForm}>Log In</button>
                <button type="button" className="toggle-btn" onClick={displayRegisterForm}>Register</button>
            </div>
            {displayLogin && <div className="social-icons">
                <img 
                    src={process.env.PUBLIC_URL + '/images/google.png'} 
                    alt="google login"/>
            </div>}
            <form id="login" ref={loginFormRef} className="input-group">
                <input name="username" value={username} onChange={handleChangeUsername} type="text" className="input-field" placeholder="Enter your username"/>
                <input name="password" value={password} onChange={handleChangePassword} type="password" className="input-field" placeholder="Enter your password"/>
                <button type="submit" className="submit-btn" onClick={handleLogin}>Login</button>
            </form>
            <form id="register" ref={registerFormRef} className="input-group">
                <input name="fullName" value={fullName} onChange={handleChangeFullName} type="text" className="input-field" placeholder="Enter your full name"/>
                <input name="username" value={username} onChange={handleChangeUsername} type="text" className="input-field" placeholder="Create a username"/>
                <input name="password" value={password} onChange={handleChangePassword} type="password" className="input-field" placeholder="Create a password"/>
                <button type="submit" className="submit-btn" onClick={handleRegister}>Register</button>
            </form>
        </div>
    </div>
}