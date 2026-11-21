// import React, { useState } from 'react'
// import SideBar from '../components/SideBar'
// import { Outlet } from 'react-router-dom'
// import { Menu, X } from 'lucide-react'
// import Loading from '../components/Loading'
// import { useSelector } from 'react-redux'
// import MessageListener from '../components/MessageListener'

// const Layout = () => {

//   const { value: user, loading, error } = useSelector(
//     (state) => state.user
//   )

//   const [SideBarOpen, setSideBarOpen] = useState(false)

//   if (loading || (!user && !error)) {
//     return <Loading />
//   }

//   if (error || !user) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <p className="text-red-500">
//           Unable to load user data. Please login again.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className='w-full flex h-screen'>

//       {/* Global message listener */}
//       <MessageListener />

//       <SideBar
//         SideBarOpen={SideBarOpen}
//         setSideBarOpen={setSideBarOpen}
//       />

//       <div className='flex-1 bg-slate-50'>
//         <Outlet />
//       </div>

//       {SideBarOpen ?
//         <X
//           className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
//           onClick={() => setSideBarOpen(false)}
//         />
//         :
//         <Menu
//           className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
//           onClick={() => setSideBarOpen(true)}
//         />
//       }

//     </div>
//   )
// }

// export default Layout


import React, { useState } from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'
import MessageListener from '../components/MessageListener'

const Layout = () => {
  const { value: user, loading, error } = useSelector(
    (state) => state.user
  )

  const [SideBarOpen, setSideBarOpen] = useState(false)

  if (loading || (!user && !error)) {
    return <Loading />
  }

  if (error || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">
          Unable to load user data. Please login again.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex w-full h-screen overflow-hidden">

      {/* Global message listener */}
      <MessageListener />

      <SideBar
        SideBarOpen={SideBarOpen}
        setSideBarOpen={setSideBarOpen}
      />

      {/* Mobile sidebar backdrop */}
      {SideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 sm:hidden"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
        <Outlet />
      </div>

      {/* Mobile menu button */}
      <button
        className="fixed top-3 right-3 z-50 bg-white rounded-md shadow p-2 sm:hidden"
        onClick={() => setSideBarOpen(!SideBarOpen)}
      >
        {SideBarOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

    </div>
  )
}

export default Layout
