

import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import VideoCall from "../components/VideoCall";

const Chat = ({ selectedStudent, setRoomId = () => { } }) => {
  const selectedStudentId = selectedStudent?._id || "";

  const currentUser = JSON.parse(localStorage.getItem("user"));
  let receiverId;
  if (currentUser.role === "mentor") {
    receiverId = selectedStudentId;
  } else {
    receiverId = "6a071e20a0fb46bf892f8b37";
  }


  const senderName = currentUser.name;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null); //  NEW: Save the offer
  const earlyIceCandidates = useRef([]); // NEW: Catch early ICE candidates

  const roomId = [currentUser.id, receiverId].sort().join("_");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!receiverId) return;
    if (typeof setRoomId !== "function") {
      console.log("setRoomId still not ready");
      return;
    }

    setRoomId(roomId);

    socket.emit("join_room", roomId);
    const handleLoadMessages = (data) => {
      setMessages(data);
    };

    socket.on("load_messages", handleLoadMessages);
    return () => {
      socket.off("load_messages", handleLoadMessages);
    };
  }, [receiverId]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit("send_message", {
      roomId,
      message,
      time: new Date().toLocaleTimeString()
    });

    setMessage("");
  };

  useEffect(() => {
    const handleOffer = (offer) => {
      console.log("Incoming call received");
      setIncomingOffer(offer); // Save the offer
      setIncomingCall(true);
    };

    const handleEarlyIce = (candidate) => {
      //  Catch ICE candidates that arrive before the Video component mounts
      earlyIceCandidates.current.push(candidate);
    };

    socket.on("offer", handleOffer);
    socket.on("ice-candidate", handleEarlyIce); // Listen for early ICE

    return () => {
      socket.off("offer", handleOffer);
      socket.off("ice-candidate", handleEarlyIce);
    };
  }, []);

  if (incomingCall) {
    return (
      <VideoCall
        roomId={roomId}
        isCaller={false}
        incomingOffer={incomingOffer}  // Pass it down
        earlyIceCandidates={earlyIceCandidates.current} // Pass them down
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h2 style={styles.header}>Chat with {selectedStudent ? selectedStudent.name : "Mentor"} </h2>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => {
            const isMe = msg.senderName === senderName;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isMe ? "#4f46e5" : "#e5e7eb",
                    color: isMe ? "white" : "black",
                    borderBottomRightRadius: isMe ? "0px" : "12px",
                    borderBottomLeftRadius: isMe ? "12px" : "0px"
                  }}
                >
                  {!isMe && (
                    <div style={styles.author}>{msg.senderName}</div>
                  )}
                  <div>{msg.message}</div>
                  <div style={styles.time}>{msg.time}</div>
                </div>
              </div>
            );
          })}

          {/* scroll anchor */}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={styles.inputContainer}>
          <input
            style={styles.input}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button style={styles.button}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6"
  },
  chatBox: {
    width: "400px",
    height: "600px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  header: {
    padding: "15px",
    borderBottom: "1px solid #ddd",
    textAlign: "center"
  },
  messagesContainer: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px 12px",
    borderRadius: "12px",
    fontSize: "14px"
  },
  author: {
    fontSize: "11px",
    fontWeight: "bold",
    marginBottom: "4px"
  },
  time: {
    fontSize: "10px",
    textAlign: "right",
    marginTop: "4px",
    opacity: 0.7
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none"
  },
  button: {
    padding: "12px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    cursor: "pointer"
  }
};
