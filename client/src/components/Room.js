import axios from 'axios';
import {useEffect, useState, useRef} from 'react';
import io from "socket.io-client";
import Cookies from 'js-cookie';
import IconButton from "@material-ui/core/IconButton";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import Quill from 'quill';
import "quill/dist/quill.snow.css";

export default function ApplyTutor(props) {
    const {setDisplayNavbar, courseId} = props;
    const videoRefs = [];
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    // const [user, setUser] = useState();
    // const [socket, setSocket] = useState();
    // const [quill, setQuill] = useState();
    const localStream = useRef();
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })
    videoRefs.push({
        ref: useRef(),
        activated: false,
        userId: null
    })

    const index = useRef();
    index.current = 0;

    setDisplayNavbar(true);
    useEffect(() => {
        const ac = new AbortController();
        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(async (res) => {
                if (res.isLoggedIn) {
                    const quill = new Quill("#textEditor", {theme: "snow", placeholder: 'Start typing here...',})
                    const user = res.user;
                    props.setUser(user);
                    const configuration = {
                        iceServers: [
                            {
                                urls: [
                                'stun:stun1.l.google.com:19302',
                                'stun:stun2.l.google.com:19302',
                                ],
                            },
                            ],
                            iceCandidatePoolSize: 10,
                    };
                    localStream.current = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    })
                    document.querySelector('#localVideo').srcObject = localStream.current;
                    const socket = io.connect(process.env.NODE_ENV === "production" ? "https://www.tutorgenic.com" : "http://localhost:5000", {
                        query: 'session_id=' + Cookies.get('connect.sid').replace('s:','').split('.')[0]
                    });

                    socket.emit('courseId', courseId);

                    quill.on("text-change", (delta, oldDelta, source) => {
                        if (source !== "user") return
                        socket.emit("send-changes", delta)
                    })

                    socket.on("receive-changes", delta => {
                        quill.updateContents(delta)
                    })

                    socket.on('newclient', async (newClientId) => {
                        if (newClientId !== user._id) {
                            console.log('as a caller')
                            const peerConnection = new RTCPeerConnection(configuration);
                            localStream.current.getTracks().forEach(track => {
                                peerConnection.addTrack(track, localStream.current);
                            })
                            const curr_index = index.current;
                            index.current++;
                            videoRefs[curr_index].userId = newClientId;
                            // as caller
                            socket.emit('callerPing', {
                                from: user._id,
                                destination: newClientId,
                            })

                            socket.on('calleePing', async (msg) => {
                                if (msg.destination == user._id && msg.from === newClientId) {
                                    var answered = false;
                                    const remoteStream = new MediaStream();
                                    // setRemoteStreams(prevData => {
                                    //     return [...prevData, remoteStream];
                                    // })

                                    videoRefs[curr_index].ref.current.style.display = "";
                                    videoRefs[curr_index].ref.current.srcObject = remoteStream;
                                    // const temp = document.createElement('video');
                                    // temp.srcObject = remoteStream;

                                    const localIceCandidates = [];

                                    peerConnection.addEventListener('connectionstatechange', () => {
                                        if (peerConnection.connectionState === "connected") {
                                            // document.getElementById('videos').appendChild(temp);
                                            console.log('connected');
                                        }
                                    });

                                    peerConnection.addEventListener('track', event => {
                                        event.streams[0].getTracks().forEach(track => {
                                            remoteStream.addTrack(track);
                                        })
                                    })

                                    peerConnection.addEventListener('icecandidate', event => {
                                        if (!event.candidate) {
                                            return;
                                        }
                                        if (answered) {
                                            socket.emit('callerCandidates', {
                                                from: user._id,
                                                destination: newClientId,
                                                content: event.candidate.toJSON()
                                            })
                                        } else {
                                            localIceCandidates.push(event.candidate.toJSON());
                                        }
                                    })

                                    const offer = await peerConnection.createOffer();
                                    await peerConnection.setLocalDescription(offer);
                                    const roomWithOffer = {
                                        type: offer.type,
                                        sdp: offer.sdp
                                    };
                                    socket.emit('offer', {
                                        from: user._id,
                                        destination: newClientId,
                                        content: roomWithOffer
                                    })

                                    socket.on('answer', async (answer) => {
                                        const {from, destination, content} = answer;
                                        if (from === newClientId && destination === user._id) {
                                            const rtcSessionDescription = new RTCSessionDescription(content);
                                            console.log(content);
                                            await peerConnection.setRemoteDescription(rtcSessionDescription);
                                            answered = true;
                                            for (var i = 0; i < localIceCandidates.length; i++) {
                                                socket.emit('callerCandidates', {
                                                    from: user._id,
                                                    destination: newClientId,
                                                    content: localIceCandidates[i]
                                                })
                                            }
                                        }
                                    })

                                    socket.on('calleeCandidates', async (icecandidate) => {
                                        const {from, content, destination} = icecandidate;
                                        if (from === newClientId && destination === user._id) {
                                            await peerConnection.addIceCandidate(new RTCIceCandidate(content));
                                        }
                                    })

                                    socket.on('disconnected', (userId) => {
                                        if (userId === newClientId) {
                                            for (var i = 0; i < videoRefs.length; i++) {
                                                if (videoRefs[i].userId && videoRefs[i].userId === userId) {
                                                    videoRefs[i].ref.current.style.display = "none";
                                                    videoRefs[i].ref.current.srcObject = null;
                                                    videoRefs[i].activated = false;
                                                    videoRefs[i].userId = null;
                                                    if (remoteStream) {
                                                        remoteStream.getTracks().forEach(track => track.stop());
                                                    }
                                                    if (peerConnection) {
                                                        peerConnection.close();
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }
                            })
                        } 
                    })

                    socket.on('callerPing', msg => {
                        if (msg.destination === user._id) {
                            const peerConnection = new RTCPeerConnection(configuration);
                            localStream.current.getTracks().forEach(track => {
                                peerConnection.addTrack(track, localStream.current);
                            })
                            const curr_index = index.current;
                            index.current++;
                            videoRefs[curr_index].userId = msg.from;
                            const callerId = msg.from;
                            socket.emit('calleePing', {
                                from: user._id,
                                destination: callerId
                            })

                            const remoteStream = new MediaStream();
                            // setRemoteStreams(prevData => {
                            //     return [...prevData, remoteStream];
                            // })
                            // const temp = document.createElement('video');
                            // temp.srcObject = remoteStream;

                            videoRefs[curr_index].ref.current.style.display = "";
                            videoRefs[curr_index].ref.current.srcObject = remoteStream;

                            peerConnection.addEventListener('connectionstatechange', () => {
                                if (peerConnection.connectionState === "connected") {
                                    // document.getElementById('videos').appendChild(temp);
                                    console.log('connected');
                                }
                            });

                            peerConnection.addEventListener('track', event => {
                                event.streams[0].getTracks().forEach(track => {
                                    remoteStream.addTrack(track);
                                })
                            })

                            const localIceCandidates = [];
                            var doneNegotiation = false;

                            peerConnection.addEventListener('icecandidate', event => {
                                if (!event.candidate) {
                                    return;
                                }
                                if (doneNegotiation) {
                                    socket.emit('calleeCandidates', {
                                        from: user._id,
                                        destination: callerId,
                                        content: event.candidate.toJSON()
                                    })
                                } else {
                                    localIceCandidates.push(event.candidate.toJSON())
                                }
                            })

                            socket.on('offer', async (offer) => {
                                const {from, destination, content} = offer;
                                if (from === callerId && destination === user._id) {
                                    console.log(content);
                                    await peerConnection.setRemoteDescription(new RTCSessionDescription(content));
                                    const answer = await peerConnection.createAnswer();
                                    await peerConnection.setLocalDescription(answer);

                                    const roomWithAnswer = {
                                        type: answer.type,
                                        sdp: answer.sdp
                                    }

                                    socket.emit('answer', {
                                        from: user._id,
                                        destination: callerId,
                                        content: roomWithAnswer
                                    })
                                }
                            })

                            socket.on('callerCandidates', async (icecandidate) => {
                                const {from, destination, content} = icecandidate;
                                if (from === callerId && destination === user._id) {
                                    await peerConnection.addIceCandidate(new RTCIceCandidate(content));
                                    doneNegotiation = true;
                                    for (var i = 0; i < localIceCandidates.length; i++) {
                                        socket.emit('calleeCandidates', {
                                            from: user._id,
                                            destination: callerId,
                                            content: localIceCandidates[i]
                                        })
                                    }
                                }
                            })

                            socket.on('disconnected', (userId) => {
                                if (userId === callerId) {
                                    for (var i = 0; i < videoRefs.length; i++) {
                                        if (videoRefs[i].userId && videoRefs[i].userId === userId) {
                                            videoRefs[i].ref.current.style.display = "none";
                                            videoRefs[i].ref.current.srcObject = null;
                                            videoRefs[i].activated = false;
                                            videoRefs[i].userId = null;
                                            if (remoteStream) {
                                                remoteStream.getTracks().forEach(track => track.stop());
                                            }
                                            if (peerConnection) {
                                                peerConnection.close();
                                            }
                                        }
                                    }
                                }
                            })
                        }
                    })
                } else {
                    window.open('/', '_self');
                }
            })
        return () => {
            ac.abort();
        }
    }, [props.setUser])

    // {remoteStreams.map(remoteStream => {
    //     return <div>
    //         <video ref={video => {video.srcObject = remoteStream;}} autoPlay playsInLine></video><br />
    //     </div>;
    // })}

    function toggleAudioMute() {
        if (localStream.current) {
            const audioTracks = localStream.current.getAudioTracks();
            if (audioTracks.length === 0) {
                alert('No audio found');
                return;
            }
            for (var i = 0; i < audioTracks.length; ++i) {
                audioTracks[i].enabled = !audioTracks[i].enabled;
            }
            setAudioMuted(!audioMuted);
        }
    }

    function toggleVideoMute() {
        if (localStream.current) {
            const videoTracks = localStream.current.getVideoTracks();
            if (videoTracks.length === 0) {
                alert('No video found');
                return;
            }
            for (var i = 0; i < videoTracks.length; ++i) {
                videoTracks[i].enabled = !videoTracks[i].enabled;
            }
            setVideoMuted(!videoMuted);
        }
    }

    return <div className="wrapper" style={{overflow: "hidden"}}>
        <div className="content" style={{flex: "0.75", paddingTop: "0"}}>
            <div id="textEditor" style={{
                display: "flex",
                flex: "0.85",
                backgroundColor: "white",
                width: "100%",
                overflow: "hidden"
            }}>

            </div>
            <div style={{
                display: "flex",
                flex: "0.15",
                backgroundColor: "#ffffff",
                width: "100%",
                overflow: "hidden",
                placeItems: "center",
                alignItems: "center"
            }}>
                <div style={{margin: "auto"}}>
                    <IconButton style={{marginLeft: "1em"}} onClick={toggleAudioMute}>
                        {audioMuted ? <MicOffIcon fontSize="large"/> : <MicIcon fontSize="large"/>}
                    </IconButton>
                    <IconButton style={{marginLeft: "1em"}} onClick={() => {
                        alert("You're leaving this meeting.");
                        window.open('/', '_self');
                    }}><CallEndIcon fontSize="large" style={{color: "red"}}/></IconButton>
                    <IconButton style={{marginLeft: "1em"}} onClick={toggleVideoMute}>
                        {videoMuted ? <VideocamOffIcon fontSize="large" /> : <VideocamIcon fontSize="large"/>}
                    </IconButton>
                </div>
            </div>
        </div>
        <div className="sidebar" style={{flex: "0.25", overflow: "auto"}}>
            <video id="localVideo" muted autoPlay playsInLine></video><br />
            
            {videoRefs.map(videoRef => {
                return <video style={{display: "none"}} ref={videoRef.ref} autoPlay playsInLine></video>
            })}
        </div>
    </div>
}
