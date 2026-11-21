// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../api/axios";

// const initialState = {
//     messages: []
// }
// export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({token, userId}) => {
//     const { data } = await api.post('/api/messages/get', {to_user_id : userId}, {
//         headers: {Authorization: `Bearer ${token}`}
//     })
//     return data.success ? data : null
// })

// // export const fetchMessages = createAsyncThunk(
// //     'messages/fetchMessages',
// //     async ({token, userId}) => {
// //         const { data } = await api.post(
// //             '/api/messages/get',
// //             {to_user_id: userId},
// //             {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`
// //                 }
// //             }
// //         )

// //         if (!data.success) {
// //             throw new Error(data.message)
// //         }

// //         return data.messages
// //     }
// // )

// const messagesSlice = createSlice({
//     name: 'messages',
//     initialState,
//     reducers: {
//         setMessage: (state , action) => {
//             state.messages = action.payload
//         },
//         addMessage: (state , action) => {
//             state.messages = [...state.messages, action.payload]
//         },
//         resettMessage: (state) => {
//             state.messages = []
//         },
//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchMessages.fulfilled, (state, action) => {
//             if(action.payload){
//                 state.messages = action.payload.messages
//             }
//         })
//         // builder.addCase(fetchMessages.fulfilled, (state, action) => {
//         //     state.messages = action.payload
//         // })
//     }
// })
// export const {setMessage, addMessage, resettMessage} = messagesSlice.actions
// export default messagesSlice.reducer


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    messages: [],
    loading: false,
    error: null
};

export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
    async ({ token, userId }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(
                "/api/message/get",
                { to_user_id: userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!data.success) {
                return rejectWithValue(data.message || "Unable to fetch messages");
            }

            return data.messages;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

const messagesSlice = createSlice({
    name: "messages",
    initialState,

    reducers: {
        setMessage: (state, action) => {
            state.messages = action.payload;
        },

        addMessage: (state, action) => {
            const exists = state.messages.some(
                message => message._id === action.payload._id
            );

            if (!exists) {
                state.messages.push(action.payload);
            }
        },

        resettMessage: (state) => {
            state.messages = [];
            state.loading = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload || [];
            })

            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export const {
    setMessage,
    addMessage,
    resettMessage
} = messagesSlice.actions;

export default messagesSlice.reducer;
