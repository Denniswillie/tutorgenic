import axios from 'axios';
import {useEffect, useState, useRef} from 'react';
import io from "socket.io-client";
import Cookies from 'js-cookie';

export default function ApplyTutor(props) {
    const {setDisplayNavbar, setUser, courseId} = props;
    const [remoteStreams, setRemoteStreams] = useState([]);
    const videoRefs = [];
    for (var i = 0; i < 30; i++) {
        videoRefs.push({
            ref: useRef(),
            activated: false
        })
    }

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
                    const user = res.user;
                    setUser(user);
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
                    const localStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    })
                    document.querySelector('#localVideo').srcObject = localStream;
                    const socket = io.connect("https://www.tutorgenic.com", {
                        query: 'session_id=' + Cookies.get('connect.sid').replace('s:','').split('.')[0]
                    });

                    socket.emit('courseId', courseId);

                    socket.on('newclient', async (newClientId) => {
                        const curr_index = index.current;
                        index.current++;
                        const peerConnection = new RTCPeerConnection(configuration);
                        localStream.getTracks().forEach(track => {
                            peerConnection.addTrack(track, localStream);
                        })
                        if (newClientId !== user._id) {
                            console.log('as a caller')
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
                                }
                            })
                        } else {
                            console.log('as a callee')
                            socket.on('callerPing', msg => {
                                if (msg.destination === user._id) {
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
    }, [setUser])

    // {remoteStreams.map(remoteStream => {
    //     return <div>
    //         <video ref={video => {video.srcObject = remoteStream;}} autoPlay playsInLine></video><br />
    //     </div>;
    // })}

    return <div className="wrapper">
        <div className="content" style={{flex: "0.75"}}>

        </div>
        <div className="sidebar" style={{flex: "0.25", overflow: "auto"}}>
            <video id="localVideo" muted autoPlay playsInLine></video><br />
            
            {videoRefs.map(videoRef => {
                return <video style={{display: "none"}} ref={videoRef.ref} autoPlay playsInLine></video>
            })}
        </div>
    </div>
}
