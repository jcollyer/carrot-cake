const getVideoDuration = (file: File) =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src); // Clean up the object URL
      resolve(video.duration);
    };
    video.onerror = () => reject("Error loading video");
    video.src = URL.createObjectURL(file);
  });

export default getVideoDuration;
