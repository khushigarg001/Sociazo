import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Story from '../configs/models/Story.js'
import User from '../configs/models/User.js'
import { inngest } from '../inngest/index.js'

export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth()
        const {content, media_type, background_color} = req.body
        const media = req.file
        let media_url = ''

        if(media_type == 'image' || media_type == 'video') {
            const fileBuffer = fs.readFileSync(image.path);
             const base64File = fileBuffer.toString("base64")
             const response = await imagekit.upload(
               { file: base64File,
                fileName: media.originalname,
                folder: "story"}
             )
             media_url = response.url
        }

        const story= await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })

        await inngest.send({
            name: 'app/story.delete',
            data: { storyId: story._id }
        })

        res.json({success: true})

    } catch (error) {
        console.log(error)
        res.json({succes: false, message: error.message})
    }
}

export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth()
       const user =  await User.findById(userId)

       const userIds = [userId, ...Story, ...user.connections, ...user.following]

       const stories= await Story.find({
        user: {$in: userIds}
       }).populate('user').sort({createdAt: -1});

       res.json({success: true, stories})

    } catch (error) {
        console.log(error)
        res.json({succes: false, message: error.message})
    }
}