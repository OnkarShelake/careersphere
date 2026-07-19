// import express from 'express'
// import cors from 'cors'
// import dotenv from 'dotenv'
// import connectDB from './config/db.js'
// import questionnaireRoutes from './routes/questionnaireRoutes.js'
// import authRoutes from './routes/authRoutes.js'
// import recommendationRoutes from './routes/recommendationRoutes.js'
// import userRoutes from './routes/userRoutes.js'
// import User from './models/User.js'
// import Message from './models/Message.js';
// import { Server } from 'socket.io'
// import jwt from 'jsonwebtoken';
// import { createServer } from 'node:http'

// dotenv.config()

// const app = express();
// const server = createServer(app);

// const allowedOrigins = process.env.FRONTEND_URL
//     ? [process.env.FRONTEND_URL, "http://localhost:5173"]
//     : ["http://localhost:5173"];

// const io = new Server(server, {
//     cors: {
//         origin: allowedOrigins,
//         methods: ["GET", "POST"]
//     }
// });

// const PORT = process.env.PORT || 5000

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// app.get('/', (req,res)=>{
//     res.send('guidance backend is running');
// });

// app.use(express.json());

// app.use('/api/questions', questionnaireRoutes);

// app.use('/api/auth', authRoutes);
// app.use('/api', recommendationRoutes);
// app.use('/api',userRoutes);


// //chat sockets and video sockets (offer, answer handleing)

// io.use( async (socket,next)=>{
//     try {
//         const token = socket.handshake.auth.token;
//     if(!token) return next(new Error("no token provided"));

//     const decoded = jwt.verify(token,process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id);

//     socket.user = {
//         id:user._id,
//         name:user.name
//     }

//     next();
//     } catch (error) {
//         console.error("Socket auth error ",error.message);
//         next(new Error("Authentication failed"));
//     }
// });

// io.on('connection', (socket) => {
//     // console.log("User connected: ", socket.id);

//     socket.on("join_room", async (roomId) => {
//        try {
//          socket.join(roomId);
//         const oldMessages = await Message.find({ roomId }).sort({ createdAt: 1 });
//         socket.emit("load_messages", oldMessages);
//         console.log("User joined room:", socket.id, roomId);
//        } catch (error) {
//         console.error("Error during loading messages", error.message);
//        }
//     });
//     //end-call 
//     socket.on("end-call", async (roomId) => {
//         try {
//             socket.leave(roomId);
//             socket.to(roomId).emit("end-call");
//         } catch (error) {
//             console.error("Error occured during ending a call", error.message);
//         }
//     });

//     //offer (caller -> receiver)
//     socket.on("offer", async ({roomId,offer}) =>{
//         try {
//             console.log("Offer received");
//             socket.to(roomId).emit("offer",offer);

//         } catch (error) {
//             console.error("Error during accepting an offer ", error.message);
//         }
//     });

//     //answer (receiver -> caller)
//     socket.on("answer", async ({roomId, answer}) =>{
//         try {
//             console.log("answer received on the server");
//             socket.to(roomId).emit("answer", answer)
//         } catch (error) {
//             console.error("Error during sending answer", error.message);
//         }
//     });

//     socket.on("ice-candidate", async ({roomId, candidate}) =>{
//         try {
//             console.log("ICE received on console");
//             socket.to(roomId).emit("ice-candidate", candidate);
//         } catch (error) {
//             console.error("Error during passing ICE candidate", error.message);
//         }
//     });


//     socket.on("send_message", async (data) => {
//        try {
//          const { roomId, message } = data;
//          if(!roomId || !message) return;
//         // console.log(`recieved message from room : ${roomId}: ${message}`)
//         const newMessage = await Message.create({
//             roomId,
//             message,
//             senderId:socket.user.id,
//             senderName:socket.user.name
//         });

//         io.to(roomId).emit("receive_message", newMessage);


//        } catch (error) {
//         console.error("Error during sending message: ", error.message);
//        }
//     });

// });



// connectDB();



// server.listen(PORT, ()=>{
//     console.log(`guidance backend is running on port ${PORT}`);
// });

import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'

import connectDB from './config/db.js'
import questionnaireRoutes from './routes/questionnaireRoutes.js'
import authRoutes from './routes/authRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import userRoutes from './routes/userRoutes.js'
import User from './models/User.js'
import Message from './models/Message.js';
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken';
import { createServer } from 'node:http'
import aiRoutes from './routes/aiRoutes.js';


const app = express();
const server = createServer(app);

// FIX 1: Explicitly added the Vercel URL. 
// If process.env.FRONTEND_URL fails or has a typo on Render, this guarantees it works.
const allowedOrigins = [
    "https://career-guidance-two-psi.vercel.app",
    "http://localhost:5173"
];

// Fallback to add the env variable if it exists and is different
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // FIX 2: Added standard methods
        credentials: true // FIX 3: Crucial! Socket.io needs this since your Express CORS has it and you use auth tokens.
    }
});

const PORT = process.env.PORT || 5000

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('guidance backend is running');
});

app.use(express.json());

app.use('/api/questions', questionnaireRoutes);

app.use('/api/auth', authRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', userRoutes);

app.use('/api/ai', aiRoutes); // added route for AI endpoints


console.log("server api gemini key : ", process.env.GEMINI_API_KEY);

//chat sockets and video sockets (offer, answer handleing)

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("no token provided"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        socket.user = {
            id: user._id,
            name: user.name
        }

        next();
    } catch (error) {
        console.error("Socket auth error ", error.message);
        next(new Error("Authentication failed"));
    }
});

io.on('connection', (socket) => {
    // console.log("User connected: ", socket.id);

    socket.on("join_room", async (roomId) => {
        try {
            socket.join(roomId);
            const oldMessages = await Message.find({ roomId }).sort({ createdAt: 1 });
            socket.emit("load_messages", oldMessages);
            console.log("User joined room:", socket.id, roomId);
        } catch (error) {
            console.error("Error during loading messages", error.message);
        }
    });

    //end-call 
    socket.on("end-call", async (roomId) => {
        try {
            socket.leave(roomId);
            socket.to(roomId).emit("end-call");
        } catch (error) {
            console.error("Error occured during ending a call", error.message);
        }
    });

    //offer (caller -> receiver)
    socket.on("offer", async ({ roomId, offer }) => {
        try {
            console.log("Offer received");
            socket.to(roomId).emit("offer", offer);

        } catch (error) {
            console.error("Error during accepting an offer ", error.message);
        }
    });

    //answer (receiver -> caller)
    socket.on("answer", async ({ roomId, answer }) => {
        try {
            console.log("answer received on the server");
            socket.to(roomId).emit("answer", answer)
        } catch (error) {
            console.error("Error during sending answer", error.message);
        }
    });

    socket.on("ice-candidate", async ({ roomId, candidate }) => {
        try {
            console.log("ICE received on console");
            socket.to(roomId).emit("ice-candidate", candidate);
        } catch (error) {
            console.error("Error during passing ICE candidate", error.message);
        }
    });


    socket.on("send_message", async (data) => {
        try {
            const { roomId, message } = data;
            if (!roomId || !message) return;
            // console.log(`recieved message from room : ${roomId}: ${message}`)
            const newMessage = await Message.create({
                roomId,
                message,
                senderId: socket.user.id,
                senderName: socket.user.name
            });

            io.to(roomId).emit("receive_message", newMessage);


        } catch (error) {
            console.error("Error during sending message: ", error.message);
        }
    });

});

connectDB();

server.listen(PORT, () => {
    console.log(`guidance backend is running on port ${PORT}`);
});