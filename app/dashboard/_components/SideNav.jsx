'use client'
import React from 'react';
import { CircleUserRoundIcon, PanelsTopLeftIcon, FileVideo2Icon, ShieldPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const SideNav = () => {
    const MenuOption=[
        {
            id:1,
            name:"Dashboard",
            path:"/dashboard",
            icon:PanelsTopLeftIcon
        },
        {
            id:2,
            name:"Creat New",
            path:"/create-new",
            icon:FileVideo2Icon
        },
        {
            id:3,
            name:"Upgrade Plan",
            path:"/upgrade-plan",
            icon:ShieldPlusIcon
        },
        {
            id:4,
            name:"Account Settings",
            path:"/account-settings",
            icon:CircleUserRoundIcon
        },
    ]
    const path = usePathname();
  return (
    <div className='w-64 h-screen shadow-md p-5'>
        <div className='grid gap-3'>
            {MenuOption.map((item,index)=>(
                <Link href={item.path} key={index}>
                    <div className={`flex gap-3 p-3 items-center hover:bg-fuchsia-700 hover:text-white rounded-md cursor-pointer
                        ${path===item.path ? 'bg-fuchsia-700 text-white':''}`}>
                        <item.icon/>
                        <h2>{item.name}</h2>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  )
}

export default SideNav