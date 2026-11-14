// import fs from 'fs'
// import Message from '../configs/models/Message.js'

// const connections = []

// export const sseController = (req, res) => {
//     const { userId } = req.params
//     console.log("New client connected: ", userId)

//     res.setHeader('Content-Type', 'text/event-stream')
//     res.setHeader('Cache-Control', 'no-cache')
//     res.setHeader('Connection', 'keep-alive')
//     res.setHeader('Access-Control-Allow-Origin', '*')

//     connections[userId] = res

//     res.write('log: Connected to SSE stream\n\n')

//     req.on('close', () => {
//         delete connections[userId]
//         console.log("Client disconnected")
//     })
// }

// export const sendMessage = async (req, res) => {
//     try {
//         const  { userId } = req.auth()
//         const { to_user_id, text } = req.body
//         const image = req.file

//         let media_url = ''
//         let message_type = image ? 'image' : 'text'

//         if(message_type === 'image') {
//             const fileBuffer = fs.readFileSync(image.path);
//              const base64File = fileBuffer.toString("base64")
//              const response = await imagekit.upload(
//                { file: base64File,
//                 fileName: media.originalname,
//                 folder: "story"}
//              )

//              const url = imagekit.helper.buildSrc({
//                 // urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
//                 src: response.filePath,
//                 transformation: [
//                     { quality: "auto" },
//                     { format: "webp" },
//                     { width: "1280" }
//                 ]
//             });
//         }

//         const message = await Message.create({
//             from_user_id : userId,
//             to_user_id,
//             text,
//             message_type,
//             media_url
//         })
//         res.json({success: true, message})


//         const messageWithUserData= await Message.findById(message._id).populate('from_user_id');

//         if(connections[to_user_id]) {
//             connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({succes: false, message: error.message})
//     }
// }

// export const getChatMessages = async (req, res) => {
//     try {
//         const  { userId } = req.auth()
//         const { to_user_id } = req.body

//         const messages = await Message.find({
//             $or: [
//                 {from_user_id: userId, to_user_id},
//                 {from_user_id: to_user_id, to_user_id: userId}
//             ]
//         }).sort({createdAt: -1})

//         await Message.updateMany({from_user_id: to_user_id, to_user_id: userId}, {seen: true})

//         res.json({success: true, messages})
//     } catch (error) {
//         res.json({succes: false, message: error.message})
//     }
// }

// export const getUserRecentMessages = async (req,res) => {
//     try {
//      const  { userId } = req.auth() 

//      const messages = await Message.find({to_user_id: userId}.populate('from_user_id to_user_id')).sort({createdAt: -1})

//      res.json({success: true, messages})
//     } catch (error) {
//         res.json({succes: false, message: error.message})
//     }
// }


import fs from "fs";
import Message from "../configs/models/Message.js";
import imagekit from "../configs/imagekit.js";

const connections = {};

export const sseController = (req, res) => {
    const { userId } = req.params;

    console.log("New client connected:", userId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    connections[userId] = res;

    // Initial SSE connection event
    res.write(": Connected to SSE stream\n\n");

    req.on("close", () => {
        if (connections[userId] === res) {
            delete connections[userId];
        }

        console.log("Client disconnected:", userId);
    });
};


export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        if (!text?.trim() && !image) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        let media_url = "";
        const message_type = image ? "image" : "text";

        // if (image) {
        //     const fileBuffer = fs.readFileSync(image.path);
        //     const base64File = fileBuffer.toString("base64");

        //     const response = await imagekit.upload({
        //         file: base64File,
        //         fileName: image.originalname,
        //         folder: "messages"
        //     });

        //     media_url = imagekit.helper.buildSrc({
        //         src: response.filePath,
        //         transformation: [
        //             { quality: "auto" },
        //             { format: "webp" },
        //             { width: "1280" }
        //         ]
        //     });

        //     fs.unlinkSync(image.path);
        // }

if (image) {
    const response = await imagekit.files.upload({
        file: fs.createReadStream(image.path),
        fileName: image.originalname,
        folder: "messages"
    });

    media_url = response.url;

    fs.unlinkSync(image.path);
}


        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text: text || "",
            message_type,
            media_url
        });

        // Populate sender information for the receiving user
        const messageWithUserData = await Message
            .findById(message._id)
            .populate("from_user_id");

        // Send message to receiver through SSE
        if (connections[to_user_id]) {
            connections[to_user_id].write(
                `data: ${JSON.stringify(messageWithUserData)}\n\n`
            );
        }

        return res.json({
            success: true,
            message
        });

    } catch (error) {
        console.log("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                {
                    from_user_id: userId,
                    to_user_id
                },
                {
                    from_user_id: to_user_id,
                    to_user_id: userId
                }
            ]
        }).sort({ createdAt: 1 });

        // Mark received messages as seen
        await Message.updateMany(
            {
                from_user_id: to_user_id,
                to_user_id: userId,
                seen: false
            },
            {
                $set: { seen: true }
            }
        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.log("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();

        const messages = await Message.find({
            to_user_id: userId
        })
        .populate("from_user_id")
        .populate("to_user_id")
        .sort({ createdAt: -1 });

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.log("Recent messages error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
