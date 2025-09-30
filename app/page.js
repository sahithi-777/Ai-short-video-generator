import { Button } from "@/components/ui/button";
import Image from "next/image";
import {UserButton} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <h2>Subscribe </h2>
      <Button variant="destructive">Subscribe</Button>
      <UserButton/>
    </div>
  );
}
