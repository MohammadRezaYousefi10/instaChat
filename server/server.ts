import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import http from "http";
import { initSocketServer } from "./socket/socketManager.js";
import mapRouter from "./routes/mapRoutes.js";
import privacyRoutes from "./routes/privacy.js";
import contactsRoutes from "./routes/contacts.js";
import authPhoneRoutes from "./routes/authPhone.js";
import geoRoutes from "./routes/geo.js";


const app = express();

// connect to mangodb
await connectDB()

// Middleware
app.use(cors())
app.use(express.json());

app.use(clerkMiddleware())

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use("/api/users" , userRouter)
app.use("/api/messages" , messageRouter)
app.use("/api/stories" , storyRouter)
app.use("/api/map", mapRouter);
app.use("/api/privacy", privacyRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/auth/phone", authPhoneRoutes);

app.set("trust proxy", true); // مهم، وگرنه IP همیشه لوکال میاد
app.use("/api/geo", geoRoutes);

// Error handler
app.use((err:any , _req : Request , res: Response , _next : NextFunction) => {
    console.error(err);
    res.status(500).json({success : false , message: err?.message || "Something went wrong"})
})

// Http server and attach WebSocket
const server = http.createServer(app)
initSocketServer(server)

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});