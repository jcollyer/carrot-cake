import { oauth } from "@/pages/api/connect-yt";

export default async function handler(req: Request, res: Response) {
  const queryString = req.url.split("?")[1];
  const code = new URLSearchParams(queryString).get("code") || "";
  
    oauth.getToken(code, (err, tokens) => {
    if (err) {
      console.log('err');
      return;
    }

    oauth.setCredentials(tokens);
    res.cookie('tokens', tokens, {
      // set cookie for a year
      maxAge: new Date(Date.now() + 2592000),
      domain:
        process.env.NODE_ENV === 'development'
          ? 'localhost'
          : 'mern-yt-uploader-5be9c88deb19.herokuapp.com',
    });
    return (userPlaylistId = youtube.channels
      .list({
        part: ['contentDetails'],
        mine: true,
      })
      .then(
        response => {
          const playlistId =
            response.data.items[0].contentDetails.relatedPlaylists.uploads;

          res.cookie('userPlaylistId', playlistId, {
            // set cookie for a year
            maxAge: new Date(Date.now() + 2592000),
            domain:
              process.env.NODE_ENV === 'development'
                ? 'localhost'
                : 'mern-yt-uploader-5be9c88deb19.herokuapp.com',
          });
          // hack to close the window
          res.send('<script>window.close();</script>');

          if (req.query.state) {
            const {
              filename,
              title,
              description,
              videoQue,
              scheduleDate,
              categoryId,
              tags,
            } = JSON.parse(req.query.state);
            return sendToYT(
              youtube,
              videoQue,
              filename,
              title,
              description,
              scheduleDate,
              categoryId,
              tags,
            );
          }
        },
        err => {
          console.error('Execute error', err);
        },
      ));
  });
}
