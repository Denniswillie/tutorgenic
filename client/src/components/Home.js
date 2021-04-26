export default function Home() {
    return <div>
        <h1>Welcome to home page</h1>
        <button onClick={() => {
            window.open('/auth/logout', '_self');
        }}>logout</button>
    </div>
}