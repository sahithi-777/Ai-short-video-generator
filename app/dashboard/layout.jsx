"use client"
import React from 'react'
import Header from './_components/Header'
import SideNav from './_components/SideNav'

const DashboardLayout = ({ children }) => {
  return (
    <div>
        <div className="hidden md:block fixed top-[65px] w-64 h-[calc(100vh-65px)] bg-white z-10">
          <SideNav />
        </div>
        <div className="fixed top-0 left-0 right-0 z-20 bg-white">
          <Header />
        </div>
        <div className="md:ml-64 mt-[65px]">
          {children}
        </div>
    </div>
  )
}

export default DashboardLayout