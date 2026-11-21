 
// import { useEffect } from 'react';
// import { useAuth } from '@clerk/react';
// import { useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { addMessage } from '../features/messages/messagesSlice';
// import api from '../api/axios';
// import toast from 'react-hot-toast';

// const MessageListener = () => {

//     const { userId: currentUserId } = useAuth();
//     const location = useLocation();
//     const dispatch = useDispatch();

//     useEffect(() => {

//         if (!currentUserId) return;

//         const eventSource = new EventSource(
//             api.getUri({
//                 url: `/api/message/${currentUserId}`
//             })
//         );

//         console.log('Global SSE listener started');

//         eventSource.onopen = () => {
//             console.log('Global SSE connected');
//         };

//         eventSource.onmessage = (event) => {
//             try {
//                 const newMessage = JSON.parse(event.data);

//                 const senderId =
//                     typeof newMessage.from_user_id === 'object'
//                         ? newMessage.from_user_id?._id
//                         : newMessage.from_user_id;

//                 const receiverId =
//                     typeof newMessage.to_user_id === 'object'
//                         ? newMessage.to_user_id?._id
//                         : newMessage.to_user_id;

//                 if (receiverId !== currentUserId) return;

//                 // Check whether the user is currently viewing this chat
//                 const activeChat = location.pathname.match(
//                     /^\/messages\/([^/]+)$/
//                 );

//                 const activeChatUserId = activeChat
//                     ? activeChat[1]
//                     : null;

//                 if (activeChatUserId === senderId) {

//                     dispatch(addMessage(newMessage));

//                 } else {

//                     const senderName =
//                         typeof newMessage.from_user_id === 'object'
//                             ? newMessage.from_user_id?.full_name
//                             : 'Someone';

//                     toast(
//                         `${senderName || 'Someone'} sent you a message: ${
//                             newMessage.text || 'Image attachment'
//                         }`
//                     );
//                 }

//             } catch (error) {
//                 console.log('Global message listener error:', error);
//             }
//         };

//         eventSource.onerror = (error) => {
//             console.log('Global SSE error:', error);
//         };

//         return () => {
//             eventSource.close();
//             console.log('Global SSE disconnected');
//         };

//     }, [currentUserId, dispatch, location.pathname]);

//     return null;
// };

// export default MessageListener;


import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addMessage } from '../features/messages/messagesSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const MessageListener = () => {

    const { userId: currentUserId } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Track the currently opened conversation
    const activeChatId = useRef(null);

    useEffect(() => {
        const match = location.pathname.match(
            /^\/messages\/([^/]+)$/
        );

        activeChatId.current = match ? match[1] : null;

    }, [location.pathname]);


    useEffect(() => {

        if (!currentUserId) return;

        const eventSource = new EventSource(
            api.getUri({
                url: `/api/message/${currentUserId}`
            })
        );

        console.log('Global SSE listener started');

        eventSource.onopen = () => {
            console.log('Global SSE connected');
        };

        eventSource.onmessage = (event) => {

            try {

                const newMessage = JSON.parse(event.data);

                const senderId =
                    typeof newMessage.from_user_id === 'object'
                        ? newMessage.from_user_id?._id
                        : newMessage.from_user_id;

                const receiverId =
                    typeof newMessage.to_user_id === 'object'
                        ? newMessage.to_user_id?._id
                        : newMessage.to_user_id;

                if (receiverId !== currentUserId) return;

                // If the user is already viewing this conversation
                if (activeChatId.current === senderId) {

                    dispatch(addMessage(newMessage));

                } else {

                    const senderName =
                        typeof newMessage.from_user_id === 'object'
                            ? newMessage.from_user_id?.full_name
                            : 'Someone';

                    // Clickable notification
                    toast.custom((t) => (

                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate(`/messages/${senderId}`);
                            }}
                            className="bg-white shadow-lg border border-gray-200 rounded-xl p-4 flex flex-col gap-1 text-left cursor-pointer hover:bg-gray-50 transition max-w-sm w-full"
                        >

                            <span className="font-semibold text-gray-900">
                                {senderName || 'Someone'}
                            </span>

                            <span className="text-sm text-gray-600">
                                {newMessage.text || 'Sent you an image'}
                            </span>

                            <span className="text-xs text-indigo-600 font-medium mt-1">
                                Click to open conversation →
                            </span>

                        </button>

                    ), {
                        duration: 6000
                    });

                }

            } catch (error) {

                console.log(
                    'Global message listener error:',
                    error
                );

            }
        };

        eventSource.onerror = (error) => {
            console.log('Global SSE error:', error);
        };

        return () => {
            eventSource.close();
            console.log('Global SSE disconnected');
        };

    }, [currentUserId, dispatch, navigate]);

    return null;
};

export default MessageListener;
