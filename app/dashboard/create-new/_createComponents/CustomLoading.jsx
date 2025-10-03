import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from 'next/image'


const CustomLoading = ({loading}) => {
  return (
    <AlertDialog open={loading}>
  <AlertDialogContent>
    <div className='bg-white flex flex-col items-center justify-center my-10' >
        <Image src={'/progress.gif'}  alt={'Loading...'} width={100} height={100}/>
        <h2>Generating... Do not Refresh</h2>
        </div>
  </AlertDialogContent>
</AlertDialog>
  )
}

export default CustomLoading