import React from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'


const Layout = () => {
  const user = dummyUserData
  const [SideBarOpen, setSideBarOpen] = useState(false)

  return user ? (
    <div className='w-full flex h-screen'>
      <SideBar SideBarOpen = {SideBarOpen} setSideBarOpen = {setSideBarOpen}/>
      <div className='flex-1 bg-slate-50'> 
        <Outlet/ >
      </div>
      {
        SideBarOpen ? 
        <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSideBarOpen(false)}/>
        :
        <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSideBarOpen(true)}/>
      }
    </div>
  ) : (
    <Loading />
  )
}

export default Layout
