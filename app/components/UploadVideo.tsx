import Button from "@/app/components/primitives/Button";
import { CloudUpload } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import { VisuallyHidden } from "@/app/components/primitives/VisuallyHidden";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import getVideoResolution from "../utils/getVideoResolution";
import { base64ToArrayBuffer } from "../utils/base64ToArrayBuffer";
import generateVideoThumb from "../utils/generateVideoThumb";
import { useState } from "react";
import { TikTokVideoProps } from "@/types"
import TiktokUploadDialogContent from "@/app/components/TiktokUploadDialogContent";
import moment from "moment";

const UploadVideo = ({ type, setResetVideos }: { type: "youtube" | "tiktok" | "instagram", setResetVideos: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [videos, setVideos] = useState<TikTokVideoProps[]>([]);
  const [uploadVideoModalOpen, setUploadVideoModalOpen] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any, index: number) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          console.log("File dropped:", event);
          const fileData = event.target?.result;
          if (!fileData) return;
          const resolution = await getVideoResolution(file);
          const thumb = await generateVideoThumb(file);
          const thumbArrayBuffer = base64ToArrayBuffer((thumb as string).split(",")[1]);

          setVideos((prev) => [
            ...prev || [], {
              file,
              id: "",
              url: "",
              title: "",
              thumbnail: "",
              resolution,
              privacyStatus: "",
              commercialUseContent: false,
              commercialUseOrganic: false,
              interactionType: {
                comment: false,
                duet: false,
                stitch: false,
              },
              scheduleDate: moment().format("YYYY-MM-DDTHH:MM"),
              directPost: true,
              disclose: false,
              yourBrand: false,
              brandedContent: false,
              uploadProgress: 0,
              draft: true,
            }]);

          // Upload the thumbnail to S3
          await fetch(`/api/s3/presigned?fileName=${file.name.split(".mp4")[0]}-thumb.png&contentType=image/png&s3Bucket=AWS_S3_TT_THUMBS_BUCKET_NAME&region=us-east-1`)
            .then((res) => res.json())
            .then((res) => {
              const body = new Blob([thumbArrayBuffer], { type: "image/png" });

              fetch(res.signedUrl, {
                body,
                method: 'PUT',
              }).then(async (data) => {
                const thumbnail = data?.url?.split('?')[0];
                setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, thumbnail } : v));
              });
            });

          // Upload the video to S3
          await fetch(`/api/s3/presigned?fileName=${file.name}&contentType=${file.type}&s3Bucket=AWS_S3_TT_BUCKET_NAME&region=us-east-2`)
            .then((res) => res.json())
            .then((res) => {
              const body = new Blob([fileData], { type: file.type });

              fetch(res.signedUrl, {
                body,
                method: 'PUT',
              }).then(async (data) => {
                const url = data?.url?.split('?')[0];
                setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, url } : v));
              });
            });
        }
        reader.readAsArrayBuffer(file);
        setUploadVideoModalOpen(true);
      });
    }
  }, []);
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
          {type === "tiktok" && (
            <TiktokUploadDialogContent
              videos={videos}
              setVideos={setVideos}
              setResetVideos={setResetVideos}
              setUploadVideoModalOpen={setUploadVideoModalOpen}
            />
          )}
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