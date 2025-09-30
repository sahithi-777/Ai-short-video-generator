import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-1/2 flex justify-center">
              <Image
                src="/login.png"
                alt="Login illustration"
                height={100}
                width={500}
                className="object-contain rounded-2xl"
              />
            </div>
            <div className="w-1/2 flex justify-center">
              <SignUp />
            </div>
          </div>
  )
}