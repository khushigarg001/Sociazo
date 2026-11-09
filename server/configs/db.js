// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         mongoose.connection.on('connected', () => {
//             console.log('Database connected')
//         })
//         await mongoose.connect(`${process.env.MONGODB_URL}/sociazo`)
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// export default connectDB

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URL.replace(/\/+$/, "")}/sociazo`
    );

    console.log("Database connected:", mongoose.connection.name);

  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
};

export default connectDB;