"use client";

import { Button } from "antd";
import axios from "axios";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useCustomModal } from "@/hooks/use-custom-modal";
import { StartCollectionDialog } from "@/components/start-collection-dialog";

export default function Home() {
  const modal = useCustomModal();

  async function handleCollectComments() {
    const response = await axios.post("/api/comments/collect");

    console.log(response.data);
  }

  return (
    <main className="flex items-center justify-center flex-grow">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6 mb-[10%]">
        <div className="flex flex-col items-center space-y-8">
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => {
              const control = modal({
                content: (
                  <StartCollectionDialog
                    onRequestClose={() => control.destroy()}
                  />
                ),
              });
            }}
          >
            Start collecting comments
          </Button>
        </div>
      </div>
    </main>
  );
}
