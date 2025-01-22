import { Request, Response } from "express";
const Youtube = require("youtube-api");
import { oauth, scope } from "@/pages/api/youtube/connect-yt";
import fs from "fs";

const sendToYT = (
  Youtube,
  videoQue,
  files,
  title,
  description,
  scheduleDate,
  categoryId,
  tags,
) => {
  if (videoQue === 0) {
    console.log('return 200');
    process.exit(0);
  } else {
    videoQue--;
    console.log('---------sendToYT--->', {
      videoQue,
      files,
      description: Array.isArray(description)
        ? description[videoQue]
        : description,
      title: Array.isArray(title) ? title[videoQue] : title,
      scheduleDate: Array.isArray(scheduleDate)
        ? new Date(scheduleDate[videoQue])?.toISOString()
        : new Date(scheduleDate)?.toISOString(),
      categoryId: Array.isArray(categoryId) ? categoryId[videoQue] : categoryId,
      tags: Array.isArray(tags) ? tags[videoQue] : tags,
    });

    Youtube.videos.insert(
      {
        part: 'id,snippet,status',
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: Array.isArray(title) ? title[videoQue] : title,
            description: Array.isArray(description)
              ? description[videoQue]
              : description,
            categoryId: Array.isArray(categoryId)
              ? categoryId[videoQue]
              : categoryId,
            tags: Array.isArray(tags) ? tags[videoQue] : tags,
          },
          status: {
            privacyStatus: 'private',
            publishAt: Array.isArray(scheduleDate)
              ? new Date(scheduleDate[videoQue]).toISOString()
              : new Date(scheduleDate).toISOString(),
          },
        },
        media: {
          body: fs.createReadStream(`/tmp/${files[videoQue].filename}`),
        },
      },
      (err, data) => {
        console.log(err, data);
        console.log('Done');
        sendToYT(
          Youtube,
          videoQue,
          files,
          title,
          description,
          scheduleDate,
          categoryId,
          tags,
        );
      },
    );
  }
};

export default async function handler(req: Request, res: Response) {
  console.log('req.body', req.body?.files);
  if (req.files) {
    const {
      title,
      description,
      scheduleDate,
      categoryId,
      tags,
      playlistToken,
      tokens,
    } = req.body;
    const filename = req.files;
    const videoQue = Object.keys(filename).length;

    if (playlistToken !== "undefined" && tokens !== "undefined") {
      const jsonTokens = JSON.parse(tokens.split("j:")[1]);
      oauth.setCredentials(jsonTokens);
      return sendToYT(
        Youtube,
        videoQue,
        req.files,
        title,
        description,
        scheduleDate,
        categoryId,
        tags
      );
    }
    res.cookie("upload", "video", {
      maxAge: 900000,
      domain:
        process.env.NODE_ENV === "development"
          ? "localhost"
          : "mern-yt-uploader-5be9c88deb19.herokuapp.com",
    });

    return res.send(
      oauth.generateAuthUrl({
        access_type: "offline",
        scope,
        state: JSON.stringify({
          filename: req.files,
          title,
          description,
          scheduleDate,
          categoryId,
          tags,
          videoQue,
        }),
      })
    );
  }
}
