// import React, { useEffect, useState } from 'react'
// import { dummyRecentMessagesData } from '../assets/assets'
// import { Link } from 'react-router-dom'
// import moment from 'moment'
// import { useAuth, useUser } from '@clerk/react'
// import api from '../api/axios'
// import toast from 'react-hot-toast'
// import { set } from 'mongoose'

// const RecentMessages = () => {

//     const [messages, setMessages] = useState([])
//     const { user } = useUser()
//     const { getToken } = useAuth()

//     const fetchRecentMessages = async () => {
//         try {
//             const token = await getToken()
//             const { data } = await api.get('/api/user/recent-messages', {
//                 headers: { Authorization: `Bearer ${token}` }
//             })
//             if (data.success) {
//                 // setMessages(data.messages)
//                 const groupedMessages = data.messages.reduce((acc, message) => {
//                     const senderId = message.from_user_id._id;
//                     if (!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
//                         acc[senderId] = message
//                     }
//                     return acc
//                 }, {})
//                 const sortedMessages = Object.values(groupedMessages).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//                 setMessages(sortedMessages)
//             } else {
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             toast.error(error.message)
//             // console.log(error)
//         }
//     }
//     useEffect(() => {
//         if(user) {
//             fetchRecentMessages()
//             setInterval(fetchRecentMessages, 30000) 
//             return () => {clearInterval()}
//         }
        
//     }, [])
//     return (
//         <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs tet-slate-800'>
//             <h3 className='font-semibold text-slate-8 mb-4'>Recent Messages</h3>
//             <div className=' flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
//                 {
//                     messages.map((message, index) => (
//                         <Link key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
//                             <img src={message.from_user_id.profile_picture} alt="" className='w-8 h-8 rounded-full' />
//                             <div className='w-full '>
//                                 <div className='flex justify-between'>
//                                     <p className='font-medium'>{message.from_user_id.full_name}</p>
//                                     <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
//                                 </div>
//                                 <div className='flex justify-between'>
//                                     <p className='text-gray-500'>{message.text ? message.text : 'Media'}</p>
//                                     {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
//                                 </div>
//                             </div>

//                         </Link>
//                     ))
//                 }
//             </div>
//         </div>
//     )
// }

// export default RecentMessages


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAuth, useUser } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RecentMessages = () => {

    const [messages, setMessages] = useState([]);
    const { user } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {

        if (!user) return;

        let intervalId;

        const fetchRecentMessages = async () => {
            try {
                const token = await getToken();

                const { data } = await api.get(
                    '/api/user/recent-messages',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (data.success) {

                    // Group messages by sender
                    const groupedMessages = data.messages.reduce(
                        (acc, message) => {

                            const senderId =
                                message.from_user_id?._id ||
                                message.from_user_id;

                            if (!senderId) return acc;

                            if (
                                !acc[senderId] ||
                                new Date(message.createdAt) >
                                new Date(acc[senderId].createdAt)
                            ) {
                                acc[senderId] = message;
                            }

                            return acc;

                        }, {}
                    );

                    // Sort by latest message
                    const sortedMessages = Object.values(
                        groupedMessages
                    ).sort(
                        (a, b) =>
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                    );

                    setMessages(sortedMessages);

                } else {
                    toast.error(
                        data.message || 'Unable to load recent messages'
                    );
                }

            } catch (error) {
                console.log('Recent messages error:', error);
                toast.error(
                    error.response?.data?.message ||
                    'Unable to load recent messages'
                );
            }
        };

        fetchRecentMessages();

        // Refresh recent messages every 30 seconds
        intervalId = setInterval(fetchRecentMessages, 30000);

        return () => {
            clearInterval(intervalId);
        };

    }, [user, getToken]);


    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>

            <h3 className='font-semibold text-slate-800 mb-4'>
                Recent Messages
            </h3>

            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>

                {messages.length > 0 ? (

                    messages.map((message) => {

                        const sender = message.from_user_id;

                        const senderId =
                            sender?._id || sender;

                        return (

                            <Link
                                to={`/messages/${senderId}`}
                                key={message._id}
                                className='flex items-start gap-2 py-2 px-1 hover:bg-slate-100 rounded-md transition'
                            >

                                <img
                                    src={
                                        sender?.profile_picture ||
                                        '/default-avatar.png'
                                    }
                                    alt=""
                                    className='w-8 h-8 rounded-full object-cover'
                                />

                                <div className='w-full'>

                                    <div className='flex justify-between gap-2'>

                                        <p className='font-medium truncate'>
                                            {sender?.full_name || 'Unknown User'}
                                        </p>

                                        <p className='text-[10px] text-slate-400 whitespace-nowrap'>
                                            {moment(message.createdAt).fromNow()}
                                        </p>

                                    </div>

                                    <div className='flex justify-between items-center gap-2'>

                                        <p className='text-gray-500 truncate'>
                                            {message.text || 'Media'}
                                        </p>

                                        {!message.seen && (
                                            <p className='bg-indigo-500 text-white min-w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>
                                                1
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </Link>

                        );

                    })

                ) : (

                    <p className='text-gray-400 text-center py-4'>
                        No recent messages
                    </p>

                )}

            </div>

        </div>
    );
};

export default RecentMessages;
