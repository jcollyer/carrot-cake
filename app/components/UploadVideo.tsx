import Button from "@/app/components/primitives/Button";
import { CloudUpload, Youtube } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import InstagramUploadDialogContent from "@/app/components/InstagramUploadDialogContent";
import TiktokUploadDialogContent from "@/app/components/TiktokUploadDialogContent";
import YoutubeUploadDialogContent from "@/app/components/YoutubeUploadDialogContent";
import useSetTiktokVideos from "@/app/hooks/use-set-tiktok-videos";
import useSetInstagramVideos from "@/app/hooks/use-set-instagram-videos";
import useSetYoutubeVideos from "@/app/hooks/use-set-youtube-videos";
import Spinner from "./primitives/Spinner";
import { VisuallyHidden } from "@/app/components/primitives/VisuallyHidden";
import getVideoDuration from "@/app/utils/getVideoDuration";
import { Reference } from "@prisma/client";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { useState } from "react";

type UploadVideoProps = {
  type: "tiktok" | "instagram" | "youtube";
  setResetVideos: React.Dispatch<React.SetStateAction<boolean>>;
  references: Reference[];
};
const UploadVideo = ({ type, setResetVideos, references }: UploadVideoProps) => {
  const { setTiktokVideos } = useSetTiktokVideos();
  const { setInstagramVideos } = useSetInstagramVideos();
  const { setYoutubeVideos } = useSetYoutubeVideos();
  const [videos, setVideos] = useState<any[]>([]);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any, index: number) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target?.result;
          if (!fileData) return;
          
          const duration = await getVideoDuration(file) as number;
          if (duration > 3600) {
            alert("Video duration exceeds the maximum allowed length of 60 minutes.");
            return;
          }
          
          if (type === "tiktok") {
            await setTiktokVideos(file, index, fileData as ArrayBuffer, setVideos);
          }
          if (type === "instagram") {
            await setInstagramVideos({ file, index, fileData: fileData as ArrayBuffer, setVideos });
          }
          if (type === "youtube") {
            await setYoutubeVideos(file, setVideos);
          }
        }
        reader.readAsArrayBuffer(file);
        setUploadVideoModalOpen(true);
      });
    }
  }, [setTiktokVideos, setInstagramVideos, setYoutubeVideos, setVideos, type]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div className="flex">
      <button {...getRootProps()} className="flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
        <CloudUpload
          className="flex gap-2"
          size={24}
          strokeWidth={2}
        />
        <input {...getInputProps()} name="file" />
      </button>
      <Dialog
        open={uploadVideoModalOpen}
        onOpenChange={(open) => {
          setUploadVideoModalOpen(open);
          if (!open) {
            setVideos([]);
          }
        }}
      >
        <DialogContent className="max-w-[990px]" aria-describedby="Upload TikTok Video Dialog">
          <VisuallyHidden asChild>
            <DialogTitle>My Dialog Title</DialogTitle>
          </VisuallyHidden>
          {videos.length === 0 && (<div className="flex items-center justify-center mt-10"><Spinner /></div>)}
          {type === "tiktok" && <TiktokUploadDialogContent
            videos={videos}
            setVideos={setVideos}
            setResetVideos={setResetVideos}
            setUploadVideoModalOpen={setUploadVideoModalOpen}
            references={references}
          />
          }
          {type === "instagram" && <InstagramUploadDialogContent
            videos={videos}
            setVideos={setVideos}
            setResetVideos={setResetVideos}
            setUploadVideoModalOpen={setUploadVideoModalOpen}
            references={references}
          />
          }
          {type === "youtube" && <YoutubeUploadDialogContent
            videos={videos}
            setVideos={setVideos}
            setResetVideos={setResetVideos}
            setUploadVideoModalOpen={setUploadVideoModalOpen}
            references={references}
          />
          }
          <DialogClose asChild>
            <Button variant="secondary" className="w-fit ml-auto mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
        <DialogFooter>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UploadVideo;