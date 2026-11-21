import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  // const fetchFeeds = async () => {
  //   try {
  //     setLoading(true)
  
  //     const token = await getToken()
  //     console.log("TOKEN:", token)
  
  //     const { data } = await api.get('/api/post/feed', {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  
  //     // console.log("FEED API RESPONSE:", data)
  //     console.log("FEED API RESPONSE:", JSON.stringify(data, null, 2))
  
  //     if (data.success) {
  //       console.log("POSTS:", data.posts)
  //       setFeeds(data.posts)
  //     } else {
  //       // console.log("FEED ERROR:", data.message)
  //       console.log("FEED ERROR:", JSON.stringify(data, null, 2))
  //       toast.error(data.message)
  //     }
  
  //   } catch (error) {
  //     console.log("FEED REQUEST ERROR:", error)
  //     console.log("STATUS:", error.response?.status)
  //     console.log("RESPONSE:", error.response?.data)
  
  //     toast.error(error.response?.data?.message || error.message)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchFeeds = async () => {
    try {
      setLoading(true);
  
      const token = await getToken();
  
      const { data } = await api.get('/api/post/feed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("FEED RESPONSE:", data);
  
      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("FEED ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> {
    fetchFeeds()
  }, [])

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      <div>
        <StoriesBar />
        <div className='p-4 space-y-6'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post}/>
          ))}
        </div>
      </div>


      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs  p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>SuperCharge your marketing, with powerful, easy-to-use platform built for results</p>
        </div>
        <RecentMessages />
      </div>
      
    </div>
  ) : <Loading />
}

export default Feed
