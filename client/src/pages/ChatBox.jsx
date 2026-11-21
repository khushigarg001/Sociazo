// import React, { useEffect, useRef, useState } from 'react'
// import { dummyMessagesData, dummyUserData } from '../assets/assets'
// import { ImageIcon, SendHorizontal } from 'lucide-react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useParams } from 'react-router-dom'
// import { useAuth } from '@clerk/react'
// import api from '../api/axios'
// import { addMessage, fetchMessages, resettMessage } from '../features/messages/messagesSlice'
// import toast from 'react-hot-toast'

// const ChatBox = () => {

//   const {messages} = useSelector((state) => state.messages)
//   const { userId } = useParams()
//   const { getToken } = useAuth()
//   const dispatch = useDispatch()
//   const [text, setText] = useState('')
//   const [image, setImage] = useState(null)
//   const [user, setUser] = useState(null)
//   const messagesEndRef = useRef(null)

//   const connections = useSelector((state) => state.connections.connections)

//   // const fetchUserMessages= async() => {
//   //   try {
//   //     const token = await getToken()
//   //     dispatch(fetchMessages({token, userId}))
//   //   } catch (error) {
//   //     toast.error(error.message)
//   //   }
//   // }

//   const fetchUserMessages = async () => {
//     try {
//         const token = await getToken()

//         console.log("Fetching messages for:", userId)

//         const result = await dispatch(
//             fetchMessages({ token, userId })
//         )

//         console.log("Fetched messages:", result)

//     } catch (error) {
//         toast.error(error.message)
//     }
// }

//   const sendMessage = async () => { 
//     try {
//       if(!text && !image) return 

//       const token = await getToken()
//       const formData = new FormData()
//       formData.append('to_user_id', userId)
//       formData.append('text', text)
//       image && formData.append('image', image)

//       const { data } = await api.post('/api/message/send', formData, {
//         headers: {Authorization: `Bearer ${token}`}
//       })
//       if(data.success) {
//         setText('')
//         setImage(null)
//         dispatch(addMessage(data.message))
//       } else {
//         throw new Error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {
//     fetchUserMessages()

//     return () => {
//       dispatch(resettMessage())
//     }
//   }, [userId])

 

//   useEffect(() => {
//     console.log("Connections:", connections)
//     console.log("Current userId:", userId)

//     if(connections.length > 0) {
//       const user = connections.find(connection => connection._id === userId)
//       console.log("Found chat user:", user)
//       setUser(user)
//     }
//   }, [connections, userId])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   return user && (
//     <div className='flex flex-col h-screen'>
//       <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
//         <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
//         <div>
//           <h2 className='font-semibold'>{user.full_name}</h2>
//           <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
//         </div>
//       </div>
//       <div className='p-5 md:px-10 h-full overflow-y-scroll'>
//         <div className='space-y-4 max-w-4xl mx-auto'>
//           {
//             messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => (
//               <div key={index} className={`flex flex-col ${message.to_user_id !== user._id ? 'items-start' : 'items-end'}`}>
//                 <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== user._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
//                   {
//                     message.message_type === 'image' && <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
//                   }
//                   <p>{message.text}</p>
//                 </div>
//               </div>
//             ))
//           }
//           <div ref={messagesEndRef} />
//         </div>
//       </div>
//       <div className='px-4'>
//           <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
//               <input type="text" className='flex-1 outline-none text-slate-700' placeholder='Type a message...' 
//               onKeyDown={e => e.key === 'Enter' && sendMessage()} onChange={e => setText(e.target.value)} value={text}/>
//               <label htmlFor="image">
//                 {
//                   image ? <img src={URL.createObjectURL(image)} className='h-8 rounded-full' alt="" /> : <ImageIcon className='size-7 text-gray-400 cursor-pointer'/>
//                 }
//                 <input type="file" id='image' accept='image/* ' hidden onChange={(e) => setImage(e.target.files[0])}/>
//               </label>
//               <button onClick={sendMessage} className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'>
//                 <SendHorizontal size={18}/>
//               </button>
//           </div>
//       </div>
//     </div>
//   )
// }

// export default ChatBox



import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, SendHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import {
    addMessage,
    fetchMessages,
    resettMessage
} from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';

const ChatBox = () => {

    const { messages, loading } = useSelector(
        (state) => state.messages
    );

    const connections = useSelector(
        (state) => state.connections.connections
    );

    const { userId: chatUserId } = useParams();

    const {
        getToken,
        userId: currentUserId
    } = useAuth();

    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [user, setUser] = useState(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Find the selected chat user
    useEffect(() => {
        if (!connections || !chatUserId) return;

        const selectedUser = connections.find(
            connection => connection._id === chatUserId
        );

        setUser(selectedUser || null);

    }, [connections, chatUserId]);


    // Fetch previous conversation messages
    useEffect(() => {

        if (!chatUserId) return;

        const fetchUserMessages = async () => {
            try {
                const token = await getToken();

                await dispatch(
                    fetchMessages({
                        token,
                        userId: chatUserId
                    })
                ).unwrap();

            } catch (error) {
                console.log("Fetch messages error:", error);
                toast.error(
                    typeof error === 'string'
                        ? error
                        : 'Unable to load conversation'
                );
            }
        };

        fetchUserMessages();

        return () => {
            dispatch(resettMessage());
        };

    }, [chatUserId, currentUserId, getToken, dispatch]);


    // Real-time incoming messages using SSE
    // useEffect(() => {

    //     if (!currentUserId) return;

    //     const eventSource = new EventSource(
    //         api.getUri({
    //             url: `/api/message/${currentUserId}`
    //         })
    //     );

    //     console.log("SSE connection started:", currentUserId);

    //     eventSource.onopen = () => {
    //         console.log("SSE connected successfully");
    //     };

    //     eventSource.onmessage = (event) => {
    //         try {
    //             const newMessage = JSON.parse(event.data);

    //             console.log("Incoming message:", newMessage);

    //             // Add message only if it belongs to this conversation
    //             const senderId =
    //                 typeof newMessage.from_user_id === 'object'
    //                     ? newMessage.from_user_id?._id
    //                     : newMessage.from_user_id;

    //             const receiverId =
    //                 typeof newMessage.to_user_id === 'object'
    //                     ? newMessage.to_user_id?._id
    //                     : newMessage.to_user_id;

    //             if (
    //                 (senderId === chatUserId &&
    //                     receiverId === currentUserId) ||
    //                 (senderId === currentUserId &&
    //                     receiverId === chatUserId)
    //             ) {
    //                 dispatch(addMessage(newMessage));
    //             }

    //         } catch (error) {
    //             console.log("SSE message parsing error:", error);
    //         }
    //     };

    //     eventSource.onerror = (error) => {
    //         console.log("SSE connection error:", error);
    //     };

    //     return () => {
    //         console.log("Closing SSE connection");
    //         eventSource.close();
    //     };

    // }, [currentUserId, chatUserId, dispatch]);


    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [messages]);


    // Send message
    const sendMessage = async () => {

        if ((!text.trim() && !image) || sending) return;

        try {
            setSending(true);

            const token = await getToken();

            const formData = new FormData();

            formData.append('to_user_id', chatUserId);
            formData.append('text', text);

            if (image) {
                formData.append('image', image);
            }

            const { data } = await api.post(
                // '/api/messages/send',
                "/api/message/send",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success) {

                dispatch(addMessage(data.message));

                setText('');
                setImage(null);

            } else {
                throw new Error(
                    data.message || 'Message sending failed'
                );
            }

        } catch (error) {
            console.log("Send message error:", error);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Unable to send message'
            );

        } finally {
            setSending(false);
        }
    };


    // Enter key to send
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };


    // Render messages
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">
                    Loading conversation...
                </p>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-screen">

            {/* Chat Header */}
            <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">

                <img
                    src={user.profile_picture}
                    alt=""
                    className="size-8 rounded-full"
                />

                <div>
                    <h2 className="font-semibold">
                        {user.full_name}
                    </h2>

                    <p className="text-sm text-gray-500 -mt-1.5">
                        @{user.username}
                    </p>
                </div>

            </div>


            {/* Messages */}
            <div className="p-5 md:px-10 flex-1 overflow-y-auto">

                <div className="space-y-4 max-w-4xl mx-auto">

                    {loading && messages.length === 0 && (
                        <p className="text-center text-gray-400">
                            Loading messages...
                        </p>
                    )}

                    {!loading && messages.length === 0 && (
                        <p className="text-center text-gray-400">
                            No messages yet. Start a conversation!
                        </p>
                    )}

                    {[...messages]
                        .sort(
                            (a, b) =>
                                new Date(a.createdAt) -
                                new Date(b.createdAt)
                        )
                        .map((message) => {

                            const senderId =
                                typeof message.from_user_id === 'object'
                                    ? message.from_user_id?._id
                                    : message.from_user_id;

                            const isSentByMe =
                                senderId === currentUserId;

                            return (

                                <div
                                    key={message._id}
                                    className={`flex flex-col ${
                                        isSentByMe
                                            ? 'items-end'
                                            : 'items-start'
                                    }`}
                                >

                                    <div
                                        className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                                            isSentByMe
                                                ? 'rounded-br-none'
                                                : 'rounded-bl-none'
                                        }`}
                                    >

                                        {message.message_type === 'image' && (
                                            <img
                                                src={message.media_url}
                                                className="w-full max-w-sm rounded-lg mb-1"
                                                alt="Sent attachment"
                                            />
                                        )}

                                        {message.text && (
                                            <p>{message.text}</p>
                                        )}

                                    </div>

                                </div>

                            );
                        })}

                    <div ref={messagesEndRef} />

                </div>

            </div>


            {/* Message Input */}
            <div className="px-4">

                <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">

                    <input
                        type="text"
                        className="flex-1 outline-none text-slate-700"
                        placeholder="Type a message..."
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                    />

                    <label htmlFor="image" className="cursor-pointer">

                        {image ? (
                            <img
                                src={URL.createObjectURL(image)}
                                className="h-8 rounded-full"
                                alt="Preview"
                            />
                        ) : (
                            <ImageIcon className="size-7 text-gray-400" />
                        )}

                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            hidden
                            onChange={(e) =>
                                setImage(e.target.files?.[0] || null)
                            }
                        />

                    </label>

                    <button
                        onClick={sendMessage}
                        disabled={sending}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer disabled:opacity-50 text-white p-2 rounded-full"
                    >
                        <SendHorizontal size={18} />
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ChatBox;
