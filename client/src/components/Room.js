import axios from 'axios';
import {useEffect, useState} from 'react';
import io from "socket.io-client";
import Cookies from 'js-cookie';

export default function ApplyTutor(props) {
    const {setDisplayNavbar, setUser, courseId} = props;
    const [remoteStreams, setRemoteStreams] = useState([]);

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
                                    const remoteStream = new MediaStream();
                                    setRemoteStreams(prevData => {
                                        return [...prevData, remoteStream];
                                    })
                                    peerConnection.addEventListener('track', event => {
                                        event.streams[0].getTracks().forEach(track => {
                                            remoteStream.addTrack(track);
                                        })
                                    })

                                    peerConnection.addEventListener('icecandidate', event => {
                                        if (!event.candidate) {
                                            return;
                                        }
                                        socket.emit('callerCandidates', {
                                            from: user._id,
                                            destination: newClientId,
                                            content: event.candidate.toJSON()
                                        })
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
                                            await peerConnection.setRemoteDescription(rtcSessionDescription);
                                        }
                                    })

                                    socket.on('calleeCandidates', async (icecandidate) => {
                                        const {from, content} = icecandidate;
                                        if (from === newClientId) {
                                            await peerConnection.addIceCandidate(new RTCIceCandidate(content))
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
                                    setRemoteStreams(prevData => {
                                        return [...prevData, remoteStream];
                                    })
                                    peerConnection.addEventListener('track', event => {
                                        event.streams[0].getTracks().forEach(track => {
                                            remoteStream.addTrack(track);
                                        })
                                    })

                                    peerConnection.addEventListener('icecandidate', event => {
                                        if (!event.candidate) {
                                            return;
                                        }
                                        socket.emit('calleeCandidates', {
                                            from: user._id,
                                            destination: callerId,
                                            content: event.candidate.toJSON()
                                        })
                                    })

                                    socket.on('offer', async (offer) => {
                                        const {from, destination, content} = offer;
                                        if (from === callerId && destination === user._id) {
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

    return <div className="wrapper">
        <div className="content" style={{flex: "0.75"}}>

        </div>
        <div className="sidebar" style={{flex: "0.25", overflow: "auto"}}>
            <video id="localVideo" muted autoPlay playsInLine></video><br />
            {remoteStreams.map(remoteStream => {
                return <div>
                    <video ref={video => {video.srcObject = remoteStream;}} autoPlay playsInLine></video><br />
                </div>;
            })}
        </div>
    </div>
}
