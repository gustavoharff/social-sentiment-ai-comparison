"use client";

import { Button } from "@/components/ui/button";
import { PlayIcon } from "@radix-ui/react-icons";
import axios from "axios";

export default function Home() {
  async function handleCollectComments() {
    const response = await axios.post("/api/comments/collect");

    console.log(response.data);
  }

  return (
    <main className="flex items-center justify-center flex-grow">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6 mb-[10%]">
        <div className="flex flex-col items-center space-y-8">
          <Button variant="outline" onClick={handleCollectComments}>
            <PlayIcon className="mr-2 h-4 w-4" />
            Start collecting comments
          </Button>
        </div>
      </div>
    </main>
  );
}
