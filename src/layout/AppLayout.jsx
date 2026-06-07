import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

/**
 * AppLayout layout shell wrapper matching AnimeLoom layout spec
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background-base flex">
      {/* Fixed Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-[280px] min-h-screen flex flex-col">
        {/* Centered fluid canvas container */}
        <div className="w-full max-w-[1280px] mx-auto px-10 py-8 flex-grow">
          {/* Renders current active sub-route page */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
