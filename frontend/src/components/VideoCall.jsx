import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  X,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

const VideoCall = ({ roomId, partnerName = "Peer", onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id || currentUser._id;

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const pendingCandidates = useRef([]);

  // In-Call Live Chat States
  const [showChat, setShowChat] = useState(false);
  const showChatRef = useRef(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatScrollRef = useRef(null);

  // Keep showChatRef in sync with showChat state without triggering WebRTC re-runs
  useEffect(() => {
    showChatRef.current = showChat;
    if (showChat) {
      setUnreadCount(0);
    }
  }, [showChat]);

  // Apply maximum framerate and high bitrate optimization to WebRTC sender
  const optimizeSenders = useCallback(() => {
    if (!peerConnection.current) return;
    try {
      const senders = peerConnection.current.getSenders();
      senders.forEach((sender) => {
        if (sender.track && sender.track.kind === "video") {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.degradationPreference = "maintain-framerate";
          params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
          params.encodings[0].maxFramerate = 30; // 30 FPS
          sender.setParameters(params).catch(() => {});
        }
      });
    } catch (err) {
      console.warn("Sender optimization error:", err);
    }
  }, []);

  // Audio / Mute toggle
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // Video / Camera toggle
  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  };

  // Ending call
  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    peerConnection.current = null;
    socket.emit("end-call", roomId);

    if (onEndCall) {
      onEndCall();
    } else {
      navigate("/my-sessions");
    }
  };

  // WebRTC Setup & Connection Handshake (Runs ONCE per room lifecycle)
  useEffect(() => {
    if (!roomId) return;

    let isSubscribed = true;

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" }
      ],
      iceCandidatePoolSize: 10
    });
    peerConnection.current = pc;

    // Helper: Create Offer and Send
    const createAndSendOffer = async (isRestart = false) => {
      if (!peerConnection.current) return;
      try {
        const offer = await peerConnection.current.createOffer({
          iceRestart: isRestart,
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
        setCallStatus("Calling...");
      } catch (err) {
        console.error("Create offer error:", err);
      }
    };

    // Remote Stream & Track Listener
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        setHasRemoteStream(true);
        setCallStatus("Connected");

        remoteStream.getVideoTracks().forEach((track) => {
          track.onunmute = () => setHasRemoteStream(true);
          track.onmute = () => {};
          track.onended = () => setHasRemoteStream(false);
        });
      }
    };

    // Connection State Listeners
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setCallStatus("Connected");
        setHasRemoteStream(true);
        optimizeSenders();
      } else if (state === "disconnected" || state === "failed") {
        setCallStatus("Reconnecting...");
        setHasRemoteStream(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      if (iceState === "connected" || iceState === "completed") {
        setCallStatus("Connected");
        setHasRemoteStream(true);
        optimizeSenders();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // 1. Capture Local Video & Audio with 30fps HD constraints
    const initLocalMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, min: 24 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!isSubscribed) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = mediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        mediaStream.getTracks().forEach((track) => {
          pc.addTrack(track, mediaStream);
        });

        optimizeSenders();

        // Join room on signaling server
        socket.emit("join_room", roomId);
      } catch (err) {
        console.error("Camera/Mic access error:", err);
      }
    };

    initLocalMedia();

    // 2. Automatic Signaling Handlers
    const handlePeerJoined = async () => {
      // Another peer entered the room -> Automatically start connection offer
      await createAndSendOffer(false);
    };

    const handleOffer = async (offer) => {
      try {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

        for (const c of pendingCandidates.current) {
          await peerConnection.current.addIceCandidate(c);
        }
        pendingCandidates.current = [];

        const answer = await peerConnection.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
        optimizeSenders();
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    };

    const handleAnswer = async (answer) => {
      try {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

        for (const c of pendingCandidates.current) {
          await peerConnection.current.addIceCandidate(c);
        }
        pendingCandidates.current = [];
        optimizeSenders();
      } catch (e) {
        console.error("Error handling answer:", e);
      }
    };

    const handleIce = async (candidate) => {
      try {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (e) {
        console.error("Error handling ICE:", e);
      }
    };

    const handleEndCall = () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnection.current?.close();
      if (onEndCall) onEndCall();
      else navigate("/my-sessions");
    };

    // In-Call Chat Messages
    const handleLoadMessages = (msgs) => {
      setChatMessages(msgs || []);
    };

    const handleReceiveMessage = (msg) => {
      if (msg.roomId === roomId) {
        setChatMessages((prev) => [...prev, msg]);
        if (!showChatRef.current) {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    socket.on("peer_joined", handlePeerJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIce);
    socket.on("end-call", handleEndCall);
    socket.on("load_messages", handleLoadMessages);
    socket.on("receive_message", handleReceiveMessage);

    // Teardown ONLY on unmount or roomId change
    return () => {
      isSubscribed = false;
      socket.off("peer_joined", handlePeerJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
      socket.off("end-call", handleEndCall);
      socket.off("load_messages", handleLoadMessages);
      socket.off("receive_message", handleReceiveMessage);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnection.current?.close();
    };
  }, [roomId, onEndCall, navigate, optimizeSenders]);

  // Auto-scroll chat on new message
  useEffect(() => {
    if (showChat) {
      chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChat]);

  // Send message in call
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !roomId) return;

    socket.emit("send_message", {
      roomId,
      message: chatInput.trim()
    });

    setChatInput("");
  };

  const handleManualReconnect = async () => {
    if (!peerConnection.current) return;
    try {
      const offer = await peerConnection.current.createOffer({
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
      setCallStatus("Reconnecting...");
    } catch (e) {
      console.error("Manual reconnect error:", e);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={endCall}
            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition cursor-pointer"
            title="Leave Session"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-white">
              1:1 Video Session with {partnerName}
            </h2>
            <p className="text-[11px] text-slate-400">Room: {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium ${
              callStatus === "Connected"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                : "bg-amber-950 text-amber-400 border border-amber-800/50"
            }`}
          >
            ● {callStatus}
          </span>
        </div>
      </header>

      {/* Main Call View + In-Call Chat Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Stage */}
        <div className="flex-1 relative flex items-center justify-center p-3 sm:p-4 bg-slate-950 overflow-hidden">
          <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
            {/* Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              onLoadedMetadata={() => {
                setHasRemoteStream(true);
                setCallStatus("Connected");
              }}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                hasRemoteStream ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Waiting State: ONLY visible when remote stream is NOT connected */}
            {!hasRemoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none z-0">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold mb-2">
                  {partnerName ? partnerName.charAt(0).toUpperCase() : "P"}
                </div>
                <p className="text-xs font-medium text-slate-300">Connecting with {partnerName}...</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Video will connect automatically once both peers join</p>
              </div>
            )}

            {/* Self PiP Video */}
            <div className="absolute bottom-3 right-3 w-36 h-28 sm:w-48 sm:h-36 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white">
                You
              </span>
            </div>
          </div>
        </div>

        {/* In-Call Live Chat Sidebar (Toggling this does NOT touch WebRTC or Streams) */}
        {showChat && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 flex-shrink-0">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>In-Call Chat</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-[11px]">
                  No messages yet. Send notes or links during the session.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe =
                    msg.senderId === currentUserId ||
                    msg.senderId?._id === currentUserId ||
                    msg.senderName === currentUser.name;

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-slate-500 mb-0.5 px-1">
                        {isMe ? "You" : msg.senderName || partnerName}
                      </span>
                      <div
                        className={`px-3 py-1.5 rounded-lg max-w-[85%] break-words ${
                          isMe
                            ? "bg-slate-700 text-white rounded-br-xs"
                            : "bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer className="flex justify-center items-center gap-3 py-3.5 bg-slate-900 border-t border-slate-800 z-10 flex-shrink-0">
        <button
          onClick={toggleMute}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer ${
            isMuted
              ? "bg-red-600 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer ${
            isCameraOff
              ? "bg-red-600 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        {/* Chat Toggle Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`relative px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
            showChat
              ? "bg-slate-700 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
          title="Toggle In-Call Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {unreadCount > 0 && !showChat && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center ml-1">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={handleManualReconnect}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          title="Reconnect Media"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reconnect</span>
        </button>

        <button
          onClick={endCall}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          title="End Session"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Call</span>
        </button>
      </footer>
    </div>
  );
};

export default VideoCall;