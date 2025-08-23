const generateVideoThumbnail = (file: any) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");

    video.autoplay = true;
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadeddata = () => {
      const ctx = canvas.getContext("2d");
      const height = 300
      const width = 200

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(video, 0, 0, width, height);
      video.pause();
      return resolve(canvas.toDataURL("image/png"));
    };
  });

export default generateVideoThumbnail;
