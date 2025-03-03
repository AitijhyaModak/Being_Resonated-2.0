'use client'
import Link from "next/link";
import { useState } from "react"


import { useUser } from "@clerk/nextjs";

const Profile = () => {
const [isHovered,setIsHovered]=useState(false);
 

 const {user}=useUser();

  return (
    <div className={`bg-[#3498db] mx-5 rounded-full transition-[width] ease duration-300 ${isHovered?"w-[120px]":"w-[40px] "} h-[40px]   `}  onMouseEnter={()=>{setIsHovered(true)}} onMouseLeave={()=>{setIsHovered(false)}}>
    {isHovered ? ( user ? ( <Link className="relative left-6 top-2 text-pretty " href={`/profile?id=67693a739ccd1cc6b0393d37`}>{user.firstName} </Link> ) : ( <Link href="/login"> Login</Link> ) ) :null }
    </div>
  )
}

export default Profile
