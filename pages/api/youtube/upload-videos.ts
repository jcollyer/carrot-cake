import { Request, Response } from "express";
const Youtube = require("youtube-api");
import { oauth, scope } from "@/pages/api/youtube/connect-yt";
import { getTokensCookie } from "@/app/utils";
import { Formidable } from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { send } from "process";
import {getCategoryIdFromLabel} from '@/app/utils/categories';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '/tmp');
//   },
//   filename(req, file, cb) {
//     const newFilename = `${uuidv4()}-${file.originalname}`;
//     cb(null, newFilename);
//   },
// });

// const upload = multer({
//   limits: { fieldSize: 25 * 1024 * 1024 },
//   storage,
// }).array('file');

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory
  limits: { fieldSize: 25 * 1024 * 1024 },
}).array("file");

const sendToYT = (video) => {
  const { fields, file } = video;
  // const jsonTokens = getTokensCookie(JSON.stringify(fields.tokens[0]));

  console.log("---------sendToYT--->", fields, file);
  Youtube.videos.insert(
    {
      // auth: fields.tokens[0],
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
      console.log(response);
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
    const data = await new Promise((resolve, reject) => {
      const form = new Formidable();

      form.parse(req, (err, fields, files) => {
        if (err) reject({ err });
        resolve({ err, fields, files });
      });
    });
    // console.log('-------form data--', data)
    const uploadMiddleware = upload;

    uploadMiddleware(req, res, async (err) => {
      const { cookie } = req.headers;
      const jsonTokens = getTokensCookie(cookie);
      oauth.setCredentials(jsonTokens);
      // if (err) {
      //   console.log('-------error hit')
      //   // Handle upload errors
      //   return res.status(400).json({ error: err.message });
      // }
      // Access the uploaded file
      // const files = req.files;
      // const {fields, files} = data;
      // const {file} = files;
      // const video = {fields, file: file[0]};
      let numberOfVideos = data.files.files.length;
      console.log("-------endpoint hit", numberOfVideos);
      // let video =
      while (numberOfVideos > 0) {
        --numberOfVideos;
        console.log('-------??',data.fields.categoryId[numberOfVideos])
        const video = {
          fields: {
            title: data.fields.title[numberOfVideos],
            description: data.fields.description[numberOfVideos],
            categoryId: getCategoryIdFromLabel(data.fields.categoryId[numberOfVideos]),
            tags: data.fields.tags[numberOfVideos],
            scheduleDate: data.fields.scheduleDate[numberOfVideos],
          },
          file: data.files.files[numberOfVideos],
        };
        console.log('---videos', video)
        sendToYT(video);
      }

      // Do something with the file, e.g., upload to cloud storage
      // ...

      res.status(200).json({ message: "File uploaded successfully" });
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }

  // const videos = req.body;
  // const { cookie } = req.headers;
  // const jsonTokens = getTokensCookie(cookie);
  // // console.log("req.body-----------", {
  // //   videos,
  // //   headers: req.headers,
  // // });

  // oauth.setCredentials(jsonTokens);

  // let que = req.body.length;
  // console.log("-----ss--", que);

  // while (que > 0) {
  //   sendToYT(videos[que - 1]);
  //   --que;
  // }

  // // res.cookie("upload", "video", {
  // //   maxAge: 900000,
  // //   domain:
  // //     process.env.NODE_ENV === "development"
  // //       ? "localhost"
  // //       : "mern-yt-uploader-5be9c88deb19.herokuapp.com",
  // // });

  // // return res.send(
  // //   oauth.generateAuthUrl({
  // //     access_type: "offline",
  // //     scope,
  // //     state: JSON.stringify(videos),
  // //   })
  // // );
  // res.status(200);
}
