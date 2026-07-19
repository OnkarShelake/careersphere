
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";


const VideoCall = ({ roomId, isCaller, incomingOffer, earlyIceCandidates = [] }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const navigate = useNavigate();
  // Initialize queue with the early candidates caught by Chat.jsx

  const pendingCandidates = useRef([...earlyIceCandidates]);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [stream, setStream] = useState(null);
  // function for mute and unmute
  const toggleMute = () => {
    if (!stream) return;
    if (isMuted) {
      stream.getAudioTracks()[0].enabled = true;
    }
    else {
      stream.getAudioTracks()[0].enabled = false;
    }
    setIsMuted(!isMuted);
  }

  // function to toggle camera
  const toggleCamera = async () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    console.log("these are the video tracks:", videoTrack);
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;

      setIsCameraOff(!videoTrack.enabled);
    }
  }

  //function for ending call
  // stopping the tracks of mentor side
  const endCall = () => {

    stream?.getTracks().forEach((track) => track.stop());

    peerConnection.current?.close();

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    peerConnection.current = null;

    //this will used for listen for the user then when we listen this we will also navigate the user to home page after the endcall triggers
    socket.emit("end-call", roomId);

    setIsCameraOff(false);
    setIsMuted(false);

    navigate("/");
  };

  //listening the end-call signal in user side
  useEffect(() => {
    socket.on("end-call", () => {
      stream?.getTracks().forEach((track) => track.stop());
      peerConnection.current?.close();
      navigate("/");
    });

    return () => {
      socket.off("end-call");
    }
  }, [stream])


  // Create PeerConnection
  useEffect(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    console.log("PeerConnection created");

    // recieve remote stream
    peerConnection.current.ontrack = (event) => {
      console.log("Remote stream received");

      const remoteStream = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        console.log("remotestream attached");
      }
    };

    // send ICE
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate
        });
      }
    };
  }, []);

  // Join room
  useEffect(() => {
    if (!roomId) return;
    socket.emit("join_room", roomId);
    console.log("Joined room:", roomId);
  }, [roomId]);

  // Extract handleOffer logic so it can be called manually
  const handleOffer = async (offer) => {
    console.log("Processing Offer");

    await peerConnection.current.setRemoteDescription(offer);

    // flush ICE queue (including early ones)
    for (let c of pendingCandidates.current) {
      try {
        await peerConnection.current.addIceCandidate(c);
      } catch (e) {
        console.error("ICE error", e);
      }
    }
    pendingCandidates.current = [];

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer", { roomId, answer });
  };

  // Start camera + add tracks
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setStream(mediaStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        mediaStream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, mediaStream);
        });

        console.log("Tracks added");

        //  If we are the receiver, process the offer NOW that our tracks are added
        if (incomingOffer) {
          await handleOffer(incomingOffer);
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    startCamera();
  }, [incomingOffer]);

  //  Handle ICE
  useEffect(() => {
    const handleIce = async (candidate) => {
      console.log("ICE received");

      if (peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(candidate);
      } else {
        console.log("Queueing ICE");
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on("ice-candidate", handleIce);
    return () => socket.off("ice-candidate", handleIce);
  }, []);

  // Create Offer (Mentor)
  const createOffer = async () => {
    console.log("createOffer triggered");

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer });
  };

  //  Receive Offer (User - fallback for renegotiation)
  useEffect(() => {
    socket.on("offer", handleOffer);
    return () => socket.off("offer", handleOffer);
  }, []);

  // Receive Answer (Mentor)
  useEffect(() => {
    const handleAnswer = async (answer) => {
      if (peerConnection.current.signalingState !== "have-local-offer") {
        console.log("Ignoring answer (not caller)");
        return;
      }

      console.log("Answer received");

      await peerConnection.current.setRemoteDescription(answer);

      // flush ICE queue
      for (let c of pendingCandidates.current) {
        try {
          await peerConnection.current.addIceCandidate(c);
        } catch (e) {
          console.error("ICE error", e);
        }
      }
      pendingCandidates.current = [];
    };

    socket.on("answer", handleAnswer);
    return () => socket.off("answer", handleAnswer);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-800">Live Call</h2>
        <span className="text-xs font-medium bg-red-500 text-white px-2.5 py-1 rounded-full tracking-wide">● Live</span>
      </div>

      {/* Video Area — black is appropriate for video content */}
      <div className="flex-1 relative flex justify-center items-center bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-36 h-24 object-cover absolute bottom-4 right-4 rounded-lg border-2 border-white shadow-lg"
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 p-5 bg-white border-t border-slate-200 shadow-sm flex-shrink-0">
        <button
          onClick={toggleMute}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm ${isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm ${isCameraOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        <button
          onClick={endCall}
          className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors duration-200 shadow-sm"
        >
          <PhoneOff className="w-4 h-4" />
        </button>

        {isCaller && (
          <button
            onClick={createOffer}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors duration-200 shadow-sm"
          >
            Start Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;