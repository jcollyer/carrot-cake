import { useCallback, useRef, useState } from 'react';
import { FilePlus } from 'lucide-react';
import { SquarePlus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getCookie } from 'cookies-next'
import { Categories, CategoriesType } from '@/app/utils/categories';
import { VideoProps } from '@/types/video'
import { getCategoryIdFromLabel } from '@/app/utils/categories'
import moment from 'moment';
import generateVideoThumb from '@/app/utils/generateVideoThumb';
const transparentImage = require('@/public/transparent.png');

export default function UploadPage() {
  const tokens = getCookie('tokens');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [allActive, setAllActive] = useState(false);
  const [videos, setVideos] = useState<VideoProps[]>([]);
  const [progress, setProgress] = useState<number[]>([]);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any, index: number) => {
        console.log('--------file--', file.name, file);

        const thumbnail = await generateVideoThumb(file);

        setVideos((videos: VideoProps[]) => [
          ...videos,
          {
            id: videos.length,
            file,
            title: '',
            description: '',
            scheduleDate: '',
            category: '',
            tags: '',
            thumbnail: thumbnail || transparentImage,
          },
        ]);
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
 
  const updateInput = (event: React.ChangeEvent<any>, inputName: string, isImageUpload?: boolean) => {
    const updatedCurrentVideo = {
      ...videos[activeIndex],
      [`${inputName}`]: isImageUpload
        ? URL.createObjectURL(event?.target?.files[0])
        : event.currentTarget.value,
    };

    const updateVideo = (video: VideoProps) => ({
      ...video,
      [`${inputName}`]: event.currentTarget.value,
    });

    const updatedVideos = videos.map(video =>
      allActive || video.id === updatedCurrentVideo.id
        ? updateVideo(video)
        : video
    );

    setVideos(updatedVideos);
  };

  const onSubmit = async (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;
    const urlparameters = 'part=snippet%2Cstatus&uploadType=resumable';

    if (!accessToken) {
      console.error('No access token found');
      return;
    }
    if(!!videos.length) {
      videos.forEach(async (video, index) => {
        const location = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?${urlparameters}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${String(accessToken)}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              categoryId: getCategoryIdFromLabel(video.category),
              description: video.description,
              title: video.title,
              tags: video.tags.split(', '), // Array of strings
            },
            status: {
              privacyStatus: 'private',
              publishAt: new Date(video.scheduleDate).toISOString(),
            },
          }),
        });
        

        // Url to upload video file from the location header
        const videoUrl =  await location.headers.get('Location');

        try {
          const response = await fetch(`${videoUrl}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'video/mp4',
            },
            body: video.file,
          });
          console.log('Video uploaded:', response)
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      });
    }
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-6">
      <h3 className="text-center text-3xl">Upload Video</h3>
      <form action="uploadVideo" method="post" encType="multipart/form-data" className="mt-12">
        <div className="flex justify-between bg-[rgba(255,255,255,0.4)]">
          <div
            className="w-full h-[180px] border-[1px] border-[solid] border-[#ccc] flex items-center justify-center"
            {...getRootProps()}
          >
            <input {...getInputProps()} name="file" />
            <SquarePlus className="mr-4" />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Click to add files</p>
            )}
          </div>
        </div>
        {!!videos.length && (
          <div>
            <div className="w-full h-4 mb-4 bg-gray-200 rounded-full dark:bg-gray-700 mt-4">
              <div
                className="h-4 bg-gray-400 rounded-full dark:bg-gray-600"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="float-left mr-3">EDIT ALL</p>
            <input
              type="checkbox"
              onClick={() => setAllActive(!allActive)}
              className="h4 w-4"
            />
          </div>
        )}
        <div className="mt-2 mb-5">
          {videos?.map((video, index) => (
            <div
              key={index}
              className={`${activeIndex === index ? 'active bg-gray-100' : ''
                } flex flex-row p-4 border-b border-slate-400`}
              style={{ background: 'rgba(255,255,255, 0.4)' }}
            >
              <div className="border-r border-slate-400 flex-row mr-2 pr-2">
                <div>{video.file?.name}</div>

                <div>{`${Math.round(video.file.size / 100000) / 10}MB`}</div>

                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt="thumbnail"
                    width="55"
                    className="opacity-50"
                  />

                  <label htmlFor="thumbnial">
                    <FilePlus className="top-12 left-4 absolute text-3xl" />
                  </label>
                  <input
                    type="file"
                    onChange={event => updateInput(event, 'thumbnail', true)}
                    name="thumbnail"
                    accept="image/png, image/jpeg, application/octet-stream"
                    placeholder="thumbnail"
                    className="hidden"
                    id="thumbnial"
                  />
                </div>
              </div>
              <div
                className="flex-row grow"
                onClick={() => setActiveIndex(index)}
                onKeyDown={() => setActiveIndex(index)}
              >
                <div
                  className={`${activeIndex !== index ? 'flex' : 'hidden'
                    } flex-col`}
                >
                  <div className="mb-2">{`Title: ${video.title}`}</div>
                  <div className="mb-2">{`Description: ${video.description}`}</div>
                  <div className="mb-2">
                    {`Scheduled Date: ${moment(video.scheduleDate).format(
                      'MM/DD/YYYY',
                    )}`}
                  </div>
                  <div className="mb-2">{`Category: ${video.category}`}</div>
                  <div className="mb-2">
                    <span>Tags:</span>
                    {video.tags.split(', ').map(tag => (
                      <span key={tag} className="bg-white rounded-lg px-2 ml-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`${activeIndex === index ? 'flex' : 'hidden'
                    } flex-col`}
                >
                  <input
                    onChange={event => updateInput(event, 'title')}
                    className="border-0 outline-0 bg-transparent mb-2"
                    name="title"
                    value={videos[activeIndex]?.title}
                    placeholder="Title:"
                  />
                  <textarea
                    name="description"
                    className="border-0 outline-0 bg-transparent h-8"
                    onChange={event => updateInput(event, 'description')}
                    value={videos[activeIndex]?.description}
                    placeholder="Description:"
                  />
                  <div className="flex mb-3">
                    <p className="text-slate-400 mr-2">Category:</p>
                    <select
                      onChange={event => updateInput(event, 'category')}
                      className="outline-0 bg-transparent border-slate-400 rounded"
                      name="category"
                      value={videos[activeIndex]?.category}
                    >
                      {Categories.map((item: CategoriesType) => (
                        <option key={item.label} value={item.label}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex mb-2">
                    <p className="text-slate-400 mr-2">Scheduled Date:</p>
                    <input
                      type="date"
                      onChange={event => updateInput(event, 'scheduleDate')}
                      className="border-0 outline-0 bg-transparent"
                      name="scheduleDate"
                      value={videos[activeIndex]?.scheduleDate}
                      placeholder="Schedule Date:"
                    />
                  </div>

                  <textarea
                    name="tags"
                    className="border-0 outline-0 bg-transparent h-6"
                    onChange={event => updateInput(event, 'tags')}
                    value={videos[activeIndex]?.tags}
                    placeholder="Tags:"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {!!videos.length && (
          <div className="flex flex-col items-center mb-10">
            <button
              type="submit"
              onClick={onSubmit}
              className="font-bold py-2 px-4 rounded border border-slate-400 hover:border-slate-500"
            >
              {`Upload ${videos.length} Video${videos.length > 1 ? 's' : ''
                } to YouTube`}
            </button>
          </div>
        )}
      </form>
      {progress.length > 0 && progress.map((progress, index) => (
        <div key={index} className="w-full h-4 mb-4 bg-gray-200 rounded-full dark:bg-gray-700 mt-4">
          <div
            className="h-4 bg-gray-400 rounded-full dark:bg-gray-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      ))}
    </div>
  );
}
