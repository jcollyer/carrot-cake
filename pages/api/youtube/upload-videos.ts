import { Request, Response } from "express";
import { oauth } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils";
import { Formidable } from "formidable";
import { VideoUploadProps } from '@/types/video'
const Youtube = require("youtube-api");
import fs from "fs";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory
  limits: { fieldSize: 25 * 1024 * 1024 },
}).array("file");

type videoType = {
  fields: VideoUploadProps,
  file: any
}

const sendToYT = (video:videoType) => {
  const { fields, file } = video;

  Youtube.videos.insert(
    {
      part: "snippet,status",
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: fields.title,
          description: fields.description,
          categoryId: fields.categoryId,
          tags: fields.tags,
        },
        status: {
          privacyStatus: "private",
          publishAt: !!fields.scheduleDate
            ? new Date(fields.scheduleDate).toISOString()
            : new Date().toISOString(),
        },
      },
      media: {
        body: fs.createReadStream(file.filepath),
      },
    },
    (err: string, response: any) => {
      if (err) {
        console.log("The API returned an error: " + err);
      }
      console.log(response?.data);
      console.log("Done");
    }
  );
};

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const data:any = await new Promise((resolve, reject) => {
      const form = new Formidable();

      form.parse(req, (err, fields, files) => {
        if (err) reject({ err });
        resolve({ err, fields, files });
      });
    });

    const uploadMiddleware = upload;

    uploadMiddleware(req, res, async (err) => {
      const { cookie } = req.headers;
      const jsonTokens = getTokensCookie(cookie);
      oauth.setCredentials(jsonTokens);

      let numberOfVideos = data.files.files.length;
      
      while (numberOfVideos > 0) {
        --numberOfVideos;

        const video = {
          fields: {
            title: data.fields.title[numberOfVideos],
            description: data.fields.description[numberOfVideos],
            categoryId: data.fields.categoryId[numberOfVideos],
            tags: data.fields.tags[numberOfVideos],
            scheduleDate: data.fields.scheduleDate[numberOfVideos],
          },
          file: data.files.files[numberOfVideos],
        };

        sendToYT(video as any);
      }
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
