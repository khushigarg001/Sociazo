// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../api/axios.js";
// import toast from "react-hot-toast";

// const initialState = {
//     value: null
// }

// // export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
// //     const { data } = await api.get('/api/user/data', {
// //         headers: { Authorization: `Bearer ${token}` }
// //     })
// //     return data.success ? data.user : null
// // })

// export const fetchUser = createAsyncThunk(
//     'user/fetchUser',
//     async (token) => {
//         try {
//             console.log("Token received:", token)

//             const { data } = await api.get('/api/user/data', {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })

//             console.log("API response:", data)

//             return data.success ? data.user : null

//         } catch (error) {
//             console.log("FETCH USER ERROR:", error)
//             console.log("Response:", error.response?.data)
//             console.log("Status:", error.response?.status)

//             throw error
//         }
//     }
// )

// export const updateUser = createAsyncThunk('user/update', async ({userData,token}) => {
//     const { data } = await api.post('/api/user/update',userData , {
//         headers: { Authorization: `Bearer ${token}` }
//     })
//     if(data.success) {
//         toast.success(data.message)
//         return data.user
//     } else{
//         toast.error(data.message)
//         return null
//     }
// })

// const userSlice = createSlice({
//     name: 'user',
//     initialState,
//     reducers: {

//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchUser.fulfilled, (state, action) => {
//             state.value = action.payload
//         }).addCase(updateUser.fulfilled, (state, action) => {
//             state.value = action.payload
//         })
//     }
// })

// export default userSlice.reducer


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

const initialState = {
    value: null,
    loading: false,
    error: null
};

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (token, { rejectWithValue }) => {
        try {
            // console.log("Token received:", token);

            const { data } = await api.get('/api/user/data', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("API response:", data);

            if (data.success) {
                return data.user;
            }

            return rejectWithValue(data.message || "Failed to fetch user");

        } catch (error) {
            console.log("FETCH USER ERROR:", error);
            console.log("Response:", error.response?.data);
            console.log("Status:", error.response?.status);

            return rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/update',
    async ({ userData, token }) => {
        const { data } = await api.post('/api/user/update', userData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (data.success) {
            toast.success(data.message);
            return data.user;
        } else {
            toast.error(data.message);
            return null;
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.value = action.payload;
                }
            });
    }
});

export default userSlice.reducer;
