import imagekit from "../configs/imagekit.js"
import Connection from "../configs/models/Connection.js"
import Post from "../configs/models/Post.js"
import User from "../configs/models/User.js"
import { toFile } from "@imagekit/nodejs"
import fs from 'fs'
import { inngest } from "../inngest/index.js"
import { clerkClient } from "@clerk/express";


// export const getUserData = async (req, res) => {
//     try {
//         const { userId } = req.auth()
//         const user = await User.findById(userId)
//         if(!user) {
//             return res.json({success: false, message: "User not found"})
//         }
//          res.json({success: true, user})
//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }


export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();

        let user = await User.findById(userId);

        // If user already exists in MongoDB
        if (user) {
            return res.status(200).json({
                success: true,
                user
            });
        }

        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        const email =
            clerkUser.emailAddresses.find(
                e => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not found in Clerk account"
            });
        }

        let username = email.split("@")[0];

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            username = `${username}${Math.floor(Math.random() * 10000)}`;
        }

        // Create missing MongoDB user
        user = await User.create({
            _id: userId,
            email,
            full_name:
                [clerkUser.firstName, clerkUser.lastName]
                    .filter(Boolean)
                    .join(" ") || "Sociazo User",
            profile_picture: clerkUser.imageUrl || "",
            username
        });

        console.log("User created in MongoDB:", userId);

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("GET USER DATA ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const updateUserData = async (req, res) => {
    try {
        console.log("UPDATE USER CONTROLLER HIT");
        console.log("FILES:", req.files)
        const { userId } = req.auth()
        let { username, bio, location, full_name } = req.body
        console.log("BODY:", req.body)

        const tempUser = await User.findById(userId)

        !username && (username = tempUser.username)

        if(tempUser.username !== username){
            const user = await User.findOne({username})
            if(user) {
                username = tempUser.username
            }
        } 

        const updatedData = {
            username, 
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

        console.log("PROFILE:", profile)
        
        if(profile) {
            const response = await imagekit.files.upload({
                file: await toFile(
                    fs.readFileSync(profile.path),
                    profile.originalname
                ),
                fileName: profile.originalname,
            })
        
            const url = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "512" }
                ]
            })
        
            updatedData.profile_picture = url
        }

        if(cover) {
            const response = await imagekit.files.upload({
                file: await toFile(
                    fs.readFileSync(cover.path),
                    cover.originalname
                ),
                fileName: cover.originalname,
            })
        
            const url = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" }
                ]
            })
        
            updatedData.cover_photo = url
        }
        console.log("UPDATED DATA:", updatedData)

        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true})

        res.json({success: true, user, message: 'Profile updated successfully '})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}


export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth()
       const { input } = req.body;
       const allUsers =  await User.find({
        $or: [
            {username: new RegExp(input, 'i')},
            {email: new RegExp(input, 'i')},
            {full_name: new RegExp(input, 'i')},
            {location: new RegExp(input, 'i')},
        ]
       })
    //    const filteredUsers = allUsers.filter(user => user._id !== userId)
    const filteredUsers = allUsers.filter(
        user => user._id.toString() !== userId
    )

       res.json({success: true, users: filteredUsers})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// export const followeUser = async (req, res) => {
//     try {
//         const { userId } = req.auth()
//        const { id } = req.body;

//        const user = await User.findById(userId)

//        if(user.following.includes(id)){
//         return res.json({success: false, message: "You are already following this user"})
//        }
       
//        user.following.push(id);
//        await user.save()

//        const toUser = await User.findById(id)
//        toUser.followers.push(userId)
//        await toUser.save()

//        res.json({success: true, message: "Now you are following this user"})

//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }


export const followeUser = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const user = await User.findById(userId)
        const toUser = await User.findById(id)

        if (!user || !toUser) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        if (user.following.includes(id)) {
            return res.json({
                success: false,
                message: "You are already following this user"
            })
        }

        user.following.push(id)
        toUser.followers.addToSet(userId)

        await user.save()
        await toUser.save()

        res.json({
            success: true,
            message: "Now you are following this user"
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth()
       const { id } = req.body;

       const user = await User.findById(userId)

       user.following= user.following.filter(user => user!==id);
       await user.save()

       const toUser = await User.findById(id)
       toUser.followers= toUser.followers.filter(user => user!==userId);
       await toUser.save()

       res.json({success: true, message: "You are no longer following this user"})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export const sendConnectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth()
        const { id } = req.body;

        const last24hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequests = await Connection.find({from_user_id: userId, createdAt: { $gt: last24hours}})
        if (connectionRequests.length >= 20) {
           return res.json({success: false, message: "You have sent more than 20 connection requests in the last 24 hours" })
        }
        const connection = await Connection.findOne({
            $or: [
                {from_user_id: userId, to_user_id: id},
                {from_user_id: id, to_user_id: userId},
            ]
        })
        if(!connection) {
           const newConnection =  await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })

            await inngest.send({
                name: 'app/connection-request',
                data: {connectionId: newConnection._id}
            })

            return res.json({success: true, message: "Connection request sent successfully" })
        } else if(connection && connection.status === 'accepted') {
            return res.json({success: false, message: 'You are already connected with this user'})
        }
        return res.json({success: false, message: 'Connection request pending'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    
    }
}

export const getUserConnections = async (req, res) => {
    try {
        const {userId} = req.auth()
        const user = await User.findById(userId).populate('connections followers following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({to_user_id: userId, status: "pending"}).populate('from_user_id')).map(connection => connection.from_user_id)

        res.json({success: true, connections, followers, following, pendingConnections})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    
    }
}

// export const acceptConnectionRequest = async (req, res) => {
//     try {
//         const {userId} = req.auth()
//         const { id } = req.body
//         const connection  = await Connection.findOne({from_user_id: id, to_user_id: userId})
        
//         if(!connection) {
//             return res.json({success: false, message: "Connection not found"})
//         }
//         const user = await connection.findById(userId) 
//         user.connections.push(id)
//         await user.save()

//         const toUser = await connection.findById(id) 
//         toUser.connections.push(userId)
//         await toUser.save()

//         connection.status = "accepted";
//         await connection.save()

//         res.json({success: true, message: 'Connection accepted successfully'})

//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
    
//     }
// }



export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const connection = await Connection.findOne({
            from_user_id: id,
            to_user_id: userId
        })

        if (!connection) {
            return res.json({
                success: false,
                message: "Connection not found"
            })
        }

        if (connection.status === "accepted") {
            return res.json({
                success: false,
                message: "Connection already accepted"
            })
        }

        const user = await User.findById(userId)
        const fromUser = await User.findById(id)

        if (!user || !fromUser) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        user.connections.addToSet(id)
        fromUser.connections.addToSet(userId)

        await user.save()
        await fromUser.save()

        connection.status = "accepted"
        await connection.save()

        res.json({
            success: true,
            message: "Connection accepted successfully"
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body
        const profile = await User.findById(profileId)
        if(!profile) {
            return res.json({success: false, message: "Profile not found"})
        }

        const posts = await Post.find({user: profileId}).populate('user')
        res.json({success: true, profile, posts})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}