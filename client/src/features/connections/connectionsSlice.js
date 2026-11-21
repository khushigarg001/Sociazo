// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "../../api/axios";

// const initialState = {
//    connections: [],
//    pendingConnections: [],
//    followers:[],
//    following: []
// }

// export const fetchConnections = createAsyncThunk('connections/fetchConnections', async(token) => {
//     const { data } = await api.get('/api/user/connections', {
//         headers: {Authorization: `Bearer ${token}`}, 
//     })
//     return data.success ? data : null;
// })

// const connectionsSlice = createSlice({
//     name: 'connections',
//     initialState,
//     reducers: {

//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchConnections.fulfilled,  (state, action) => {
//             if(action.payload) {
//                 state.connections = action.payload.connections
//                 state.pendingConnections = action.payload.pendingConnections
//                 state.followers = action.payload.followers
//                 state.following = action.payload.following
//             }
//         } )
//     }
// })

// export default connectionsSlice.reducer


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
    loading: false
};

export const fetchConnections = createAsyncThunk(
    "connections/fetchConnections",
    async (token, { rejectWithValue }) => {
        try {
            const { data } = await api.get(
                "/api/user/connections",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!data.success) {
                return rejectWithValue(data.message);
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

const connectionsSlice = createSlice({
    name: "connections",
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
            })

            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;

                state.connections = action.payload.connections || [];
                state.pendingConnections = action.payload.pendingConnections || [];
                state.followers = action.payload.followers || [];
                state.following = action.payload.following || [];
            })

            .addCase(fetchConnections.rejected, (state) => {
                state.loading = false;
            });
    }
});

export default connectionsSlice.reducer;
