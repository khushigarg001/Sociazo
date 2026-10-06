import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Post from '../configs/models/Post.js';
import User from '../configs/models/User.js';

export const addPost = async (req, res) => {
    try {
        console.log("1. addPost called");

        const { userId } = req.auth();
        console.log("2. userId:", userId);

        const { content, post_type } = req.body;
        const images = req.files || [];

        console.log("3. images:", images.length);

        let image_urls = [];

        if (images.length) {

            image_urls = await Promise.all(
                images.map(async (image) => {

                    console.log("4. uploading:", image.originalname);

                    const fileBuffer = fs.readFileSync(image.path);
                    const base64File = fileBuffer.toString("base64")

                    console.log("5. file read");

                    const response = await imagekit.files.upload({
                        file: base64File,
                        fileName: image.originalname,
                        folder: "posts"
                    });

                    console.log("6. ImageKit upload completed");

                    const url = imagekit.helper.buildSrc({
                        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                        src: response.filePath,
                        transformation: [
                            { quality: "auto" },
                            { format: "webp" },
                            { width: "1280" }
                        ]
                    });

                    console.log("7. URL created:", url);

                    return url;
                })
            );
        }

        console.log("8. Creating post");

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        });

        console.log("9. Post created");

        res.json({
            success: true,
            message: "Post created successfully"
        });

    } catch (error) {
        console.log("ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const getFeedPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)

        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1});

        res.json({succes: true, posts})
    } catch (error) {
        console.log(error)
        res.json({succes: false, message: error.message})
    }
}

export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;
        const post = await Post.findById(postId)

        if(post.likes_count.includes(userId)){
            post.likes_count= post.likes_count.filter(user => user !== userId)
            await post.save()
            res.json({success: true, message: "Post unliked"})
        } else{
            post.likes_count.push(userId)
            await post.save()
            res.json({success: true, message: "Post liked"})
        }
    } catch (error) {
        console.log(error)
        res.json({succes: false, message: error.message})
    }
}