// export const protect  = async (req, res, next) => {
//     try {
//         const { userId } = await req.auth()
//         if(!userId){
//             return res.json({success: false, message: "not authenticated"})
//         }
//         next()
//     } catch (error) {
//          res.json({success: false, message: error.message})
//     }
// }

import { getAuth } from "@clerk/express";

export const protect = (req, res, next) => {
    const { userId, isAuthenticated } = getAuth(req);

    console.log("Clerk auth:", { userId, isAuthenticated });

    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            success: false,
            message: "not authenticated"
        });
    }

    next();
};