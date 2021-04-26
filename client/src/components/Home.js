import {useState} from 'react';

export default function Home() {
    const [displayLogin, setDisplayLogin] = useState(true);
    function displayLoginForm() {
        setDisplayLogin(true);
        document.getElementById("login").style.left = "50px";
        document.getElementById("register").style.left = "450px";
        document.getElementById("btn").style.left = "0px";
    }

    function displayRegisterForm() {
        setDisplayLogin(false);
        document.getElementById("login").style.left = "-400px";
        document.getElementById("register").style.left = "50px";
        document.getElementById("btn").style.left = "110px";
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
            <form id="login" className="input-group">
                <input type="text" className="input-field" placeholder="Enter your username"/>
                <input type="password" className="input-field" placeholder="Enter your password"/>
                <button type="submit" className="submit-btn">Login</button>
            </form>
            <form id="register" className="input-group">
                <input type="text" className="input-field" placeholder="Enter your full name"/>
                <input type="text" className="input-field" placeholder="Create a username"/>
                <input type="password" className="input-field" placeholder="Create a password"/>
                <button type="submit" className="submit-btn">Register</button>
            </form>
        </div>
    </div>
}