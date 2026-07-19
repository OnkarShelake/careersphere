

// import React, { useEffect, useRef, useState } from "react";
// import socket from "../socket";
// import VideoCall from "../components/VideoCall";

// const Chat = ({ selectedStudent, setRoomId = () => { } }) => {
//   const selectedStudentId = selectedStudent?._id || "";

//   const currentUser = JSON.parse(localStorage.getItem("user"));
//   let receiverId;
//   if (currentUser.role === "mentor") {
//     receiverId = selectedStudentId;
//   } else {
//     receiverId = "6a071e20a0fb46bf892f8b37";
//   }


//   const senderName = currentUser.name;
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");

//   const [incomingCall, setIncomingCall] = useState(false);
//   const [incomingOffer, setIncomingOffer] = useState(null); //  NEW: Save the offer
//   const earlyIceCandidates = useRef([]); // NEW: Catch early ICE candidates

//   const roomId = [currentUser.id, receiverId].sort().join("_");
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (!receiverId) return;
//     if (typeof setRoomId !== "function") {
//       console.log("setRoomId still not ready");
//       return;
//     }

//     setRoomId(roomId);

//     socket.emit("join_room", roomId);
//     const handleLoadMessages = (data) => {
//       setMessages(data);
//     };

//     socket.on("load_messages", handleLoadMessages);
//     return () => {
//       socket.off("load_messages", handleLoadMessages);
//     };
//   }, [receiverId]);

//   useEffect(() => {
//     socket.on("receive_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => socket.off("receive_message");
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     socket.emit("send_message", {
//       roomId,
//       message,
//       time: new Date().toLocaleTimeString()
//     });

//     setMessage("");
//   };

//   useEffect(() => {
//     const handleOffer = (offer) => {
//       console.log("Incoming call received");
//       setIncomingOffer(offer); // Save the offer
//       setIncomingCall(true);
//     };

//     const handleEarlyIce = (candidate) => {
//       //  Catch ICE candidates that arrive before the Video component mounts
//       earlyIceCandidates.current.push(candidate);
//     };

//     socket.on("offer", handleOffer);
//     socket.on("ice-candidate", handleEarlyIce); // Listen for early ICE

//     return () => {
//       socket.off("offer", handleOffer);
//       socket.off("ice-candidate", handleEarlyIce);
//     };
//   }, []);

//   if (incomingCall) {
//     return (
//       <VideoCall
//         roomId={roomId}
//         isCaller={false}
//         incomingOffer={incomingOffer}  // Pass it down
//         earlyIceCandidates={earlyIceCandidates.current} // Pass them down
//       />
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.chatBox}>
//         <h2 style={styles.header}>Chat with {selectedStudent ? selectedStudent.name : "Mentor"} </h2>

//         {/* Messages */}
//         <div style={styles.messagesContainer}>
//           {messages.map((msg, index) => {
//             const isMe = msg.senderName === senderName;

//             return (
//               <div
//                 key={index}
//                 style={{
//                   display: "flex",
//                   justifyContent: isMe ? "flex-end" : "flex-start"
//                 }}
//               >
//                 <div
//                   style={{
//                     ...styles.messageBubble,
//                     backgroundColor: isMe ? "#4f46e5" : "#e5e7eb",
//                     color: isMe ? "white" : "black",
//                     borderBottomRightRadius: isMe ? "0px" : "12px",
//                     borderBottomLeftRadius: isMe ? "12px" : "0px"
//                   }}
//                 >
//                   {!isMe && (
//                     <div style={styles.author}>{msg.senderName}</div>
//                   )}
//                   <div>{msg.message}</div>
//                   <div style={styles.time}>{msg.time}</div>
//                 </div>
//               </div>
//             );
//           })}

//           {/* scroll anchor */}
//           <div ref={messagesEndRef}></div>
//         </div>

//         {/* Input */}
//         <form onSubmit={sendMessage} style={styles.inputContainer}>
//           <input
//             style={styles.input}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message..."
//           />
//           <button style={styles.button}>Send</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Chat;

// const styles = {
//   container: {
//     height: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f3f4f6"
//   },
//   chatBox: {
//     width: "400px",
//     height: "600px",
//     display: "flex",
//     flexDirection: "column",
//     backgroundColor: "white",
//     borderRadius: "12px",
//     boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//     overflow: "hidden"
//   },
//   header: {
//     padding: "15px",
//     borderBottom: "1px solid #ddd",
//     textAlign: "center"
//   },
//   messagesContainer: {
//     flex: 1,
//     padding: "15px",
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px"
//   },
//   messageBubble: {
//     maxWidth: "70%",
//     padding: "10px 12px",
//     borderRadius: "12px",
//     fontSize: "14px"
//   },
//   author: {
//     fontSize: "11px",
//     fontWeight: "bold",
//     marginBottom: "4px"
//   },
//   time: {
//     fontSize: "10px",
//     textAlign: "right",
//     marginTop: "4px",
//     opacity: 0.7
//   },
//   inputContainer: {
//     display: "flex",
//     borderTop: "1px solid #ddd"
//   },
//   input: {
//     flex: 1,
//     padding: "12px",
//     border: "none",
//     outline: "none"
//   },
//   button: {
//     padding: "12px 16px",
//     backgroundColor: "#4f46e5",
//     color: "white",
//     border: "none",
//     cursor: "pointer"
//   }
// };




import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import VideoCall from "../components/VideoCall";
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';



const Chat = ({ selectedStudent, setRoomId = () => { } }) => {
  const selectedStudentId = selectedStudent?._id || "";

  // const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = JSON.parse(localStorage.getItem("user"));

  let receiverId;
  if (currentUser.role === "mentor") {
    receiverId = selectedStudentId;
  } else {
    receiverId = "6a071e20a0fb46bf892f8b37";
  }
  const navigate = useNavigate();
  const senderName = currentUser.name;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null); //  NEW: Save the offer
  const earlyIceCandidates = useRef([]); // NEW: Catch early ICE candidates

  const roomId = [currentUser.id, receiverId].sort().join("_");
  const messagesEndRef = useRef(null);

  // useEffect(() =>{
  //   console.log("currentUseer is:", currentUser.id);
  //   console.log("roomId is:",roomId);
  // },[])
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
  }, [receiverId,roomId,setRoomId]);

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

        <div className="flex items-center justify-content gap-15 p-4 border-b border-gray-200 bg-white">
          
          <button onClick={() => navigate('/')} className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 transition-all duration-200 hover:scale-105 active:scale-95">
            <IoArrowBack size={24} color="white" />
          </button>

          <h2 style={styles.header}>Chat with {selectedStudent ? selectedStudent.name : "Mentor"} </h2>
        </div>


        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => {
            const isMe = msg.senderName === senderName;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  width: "100%"
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isMe ? "#4f46e5" : "#ffffff",
                    color: isMe ? "white" : "#1f2937",
                    borderBottomRightRadius: isMe ? "4px" : "16px",
                    borderBottomLeftRadius: isMe ? "16px" : "4px",
                    borderTopRightRadius: "16px",
                    borderTopLeftRadius: "16px",
                  }}
                >
                  {!isMe && (
                    <div style={styles.author}>{msg.senderName}</div>
                  )}
                  <div>{msg.message}</div>
                  <div style={{ ...styles.time, color: isMe ? "#e0e7ff" : "#9ca3af" }}>
                    {msg.time}
                  </div>
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
            placeholder="Type your message..."
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
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6", // Soft gray background
    padding: "20px", // Breathing room for smaller screens
    boxSizing: "border-box",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  chatBox: {
    width: "100%",
    maxWidth: "500px", // Adapts up to 500px wide
    height: "100%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.03)",
    overflow: "hidden"
  },
  header: {
    padding: "20px",
    margin: 0,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f3f4f6",
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#111827"
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "#f9fafb"
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    fontSize: "0.95rem",
    lineHeight: "1.4",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    wordWrap: "break-word"
  },
  author: {
    fontSize: "0.75rem",
    fontWeight: "600",
    marginBottom: "4px",
    opacity: 0.8
  },
  time: {
    fontSize: "0.7rem",
    textAlign: "right",
    marginTop: "6px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #f3f4f6",
    gap: "12px"
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "24px",
    outline: "none",
    fontSize: "0.95rem",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box"
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "24px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
    transition: "background-color 0.2s"
  }
};