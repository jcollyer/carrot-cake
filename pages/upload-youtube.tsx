import { MenuProvider, Menu, MenuButton, MenuItem } from '@/app/components/primitives/Menu';
import Button from '@/app/components/primitives/Button';
import clsx from 'clsx';
import prisma from "@/lib/prisma";
import { Reference } from '@prisma/client';
const transparentImage = require('@/public/transparent.png');
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { useCallback, useState } from 'react';
import { BookMarked, BookmarkPlus, FilePlus, SquarePlus, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getCookie } from 'cookies-next'
import { Categories, CategoriesType, getCategoryLabelfromId } from '@/app/utils/categories';
import generateVideoThumb from '@/app/utils/generateVideoThumb';
import moment from 'moment';
import { SanitizedVideoProps } from '@/types/video'

export const getServerSideProps = async (context:any) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const references = await prisma.user.findUnique({
    where: {
      email:session?.user?.email,
    },
    select: {
      references: {
        select: { id: true, value: true, type: true },
      },
    },
  });

  return {
    props: references,
  };
};

export default function UploadYouTubePage({ references }: { references: Reference[] }) {
  const tokens = getCookie('tokens');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [allActive, setAllActive] = useState(false);
  const [videos, setVideos] = useState<SanitizedVideoProps[]>([]);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any) => {
        const thumbnail = await generateVideoThumb(file);

        setVideos((videos: SanitizedVideoProps[]) => [
          ...videos,
          {
            categoryId: "1",
            description: "",
            file,
            title: "",
            scheduleDate: moment().format('YYYY-MM-DD'),
            tags: undefined,
            thumbnail: thumbnail || transparentImage,
          },
        ]);
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const updateInput = (event: React.ChangeEvent<any>, inputName: string, index: number) => {
    const updatedVideos = videos.map((video, i) => {
      if (allActive || i === index) {
        return {
          ...video,
          [`${inputName}`]: inputName === 'thumbnail'
            ? URL.createObjectURL(event?.target?.files[0])
            : event.currentTarget.value,
        }
      }
      return video;
    });

    setVideos(updatedVideos);
  };

  const tryToUpload = async (accessToken: string, urlparameters: string, video: SanitizedVideoProps) => {
    try {
      const location = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?${urlparameters}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${String(accessToken)}`,
        },
        body: JSON.stringify({
          snippet: {
            categoryId: video.categoryId,
            description: video.description,
            title: video.title,
            tags: video.tags
          },
          status: {
            privacyStatus: 'private',
            publishAt: new Date(video.scheduleDate ?? new Date()).toISOString(),
          },
        }),
      });
      // Url to upload video file from the location header
      const videoUrl = await location.headers.get('Location');
      try {
        const response = await fetch(`${videoUrl}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
          },
          body: video.file,
        });
        console.log('Video uploaded:', response)
        setVideos([]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } catch {
      // If the access token is expired, refresh it and try again
      try {
        const refreshToken = JSON.parse(tokens as string)?.refresh_token;
        const refreshResponse = await fetch('/api/youtube/connect-yt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (!refreshResponse) {
          console.error('No refresh response');
          return;
        }
        const refreshData = await refreshResponse.json();
        const config = refreshData?.res?.config;
        const {url, body, headers } = config;
        
        await fetch(url, {
          method: 'POST',
          headers,
          body,
        }).then(async (res) => {
          const { access_token } = await res.json();
          // Try uploading the video again with the new access token
          await tryToUpload(access_token, urlparameters, video);
        });
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  }

  const onSubmit = async (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;
    const urlparameters = 'part=snippet%2Cstatus&uploadType=resumable';

    if (!accessToken) {
      console.error('No access token found');
      return;
    }
    if (!!videos.length) {
      videos.forEach(async (video) => tryToUpload(accessToken, urlparameters, video));
    }
  };

  const setReferencePost = useCallback((value: string, type: string) => {
    fetch("/api/reference/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceTitle: value.split(" ").slice(0, 2).join(" "),
        referenceValue: value,
        referenceType: type,
        publish: true,
      }),
    }).then(async (data) => {
      const newReference = await data.json();
      setLocalReferences([...localReferences, newReference]);
    });
  }, []);

  const hasKey = (key: string) => {
    return localReferences.some((reference) => reference.type === key);
  };

  const setReference = (value: string, key: string) => {
    const updatedVideos = videos.map((video, i) => {
      if (allActive || i === activeIndex) {
        return {
          ...video,
          [key]: value,
        }
      }
      return video;
    });

    setVideos(updatedVideos);
  };

  const isNewReference = (value: string) => {
    return !localReferences?.some((reference) => reference.value === value);
  };

  const deleteReference = (id: string) => {
    fetch(`/api/reference/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      setLocalReferences(localReferences.filter((reference) => reference.id !== id));
    });
  };

  const keyReferenceAddButton = (activeIndex: number, keyName: string, videos: any) => {
    const showButton = !!videos[activeIndex][keyName] && videos[activeIndex][keyName] !== "" && isNewReference(videos[activeIndex][keyName]);
    return showButton ? (
      <>
        <button
          type="button"
          onClick={() => setReferencePost(videos[activeIndex][keyName], keyName)}
        >
          <BookmarkPlus size={24} strokeWidth={1} />
        </button>
      </>
    ) : null;
  };

  const keyReferenceMenu = (key: string) => (
    <MenuProvider>
      <MenuButton>
        <BookMarked strokeWidth={1} size={24} />
      </MenuButton>
      <Menu>
        {localReferences
          .filter((reference) => reference.type === key)
          .map((ref) =>
            <MenuItem key={ref.id}>
              <button
                type="button"
                key={ref.id}
                onClick={() => setReference(ref.value, key)}
                className="truncate max-w-48 mr-2"
              >
                {ref.value}
              </button>
              <button type="button" onClick={() => deleteReference(ref.id)} className="hover:bg-gray-300 rounded p-1">
                <Trash2 strokeWidth={1} size={18} />
              </button>
            </MenuItem>
          )
        }
      </Menu>
    </MenuProvider>
  );

  return (
    <div className="flex flex-col max-w-3xl mx-auto mt-12 p-6">
      <h3 className="text-center text-3xl mt-6 font-semibold text-gray-600">Upload Video</h3>
      <form action="uploadVideo" method="post" encType="multipart/form-data" className="mt-12">
        <div className="flex justify-between">
          <div
            className="w-full h-[180px] border border-gray-300 flex items-center justify-center"
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
          <div className="flex flex-row gap-2 mt-4">
            <p className="font-semibold">EDIT ALL</p>
            <input
              type="checkbox"
              onClick={() => setAllActive(!allActive)}
              className="h4 w-4"
            />
          </div>
        )}
        <div className="mt-2 mb-5">
          {videos?.map((video, index) => (
            <div key={index} className={clsx({ "border-gray-800": activeIndex === index }, "flex flex-row py-2 border-b border-gray-400")}>
              <div className={clsx({ "border-gray-800": activeIndex === index }, "max-w-44 pr-2 border-r border-gray-400")}>
                <div className="truncate mb-2">{video.file?.name}</div>
                <div className="flex gap-2 items-center">
                  <div className="relative mb-2">
                    <img
                      src={video.thumbnail}
                      alt="thumbnail"
                      className="opacity-50 rounded"
                    />
                    <label htmlFor="thumbnial" className="top-10 left-5 absolute cursor-pointer">
                      <FilePlus strokeWidth={1} className="w-10 h-10 text-gray-700" />
                    </label>
                    <input
                      type="file"
                      onChange={event => updateInput(event, 'thumbnail', index)}
                      name="thumbnail"
                      accept="image/png, image/jpeg, application/octet-stream"
                      placeholder="thumbnail"
                      className="hidden"
                      id="thumbnial"
                    />
                  </div>
                  <div className="font-semibold text-xs pl-2">{`${Math.round(video.file.size / 100000) / 10}MB`}</div>
                </div>
              </div>
              <div
                className="flex-row grow pl-2"
                onClick={() => setActiveIndex(index)}
              >
                <div className={clsx({ "hidden": activeIndex === index }, "flex flex-col gap-2")}>
                  <div className="flex gap-2 items-center">
                    <div className="font-semibold mb-2">Title:</div>
                    <div>{video.title}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="font-semibold">Description:</div>
                    <div className="h-12">{video.description}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="font-semibold">Category:</div>
                    <div>{getCategoryLabelfromId(video.categoryId || "1")}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="font-semibold">Scheduled Date:</div>
                    <div>
                      {moment(video.scheduleDate).format('MM/DD/YYYY')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">Tags:</div>
                    <div className="flex flex-row justify-center gap-1">
                      {!!video.tags && video.tags.length > 0 && video?.tags.map(tag => (
                        <div key={tag} className="bg-gray-600 text-white rounded-full px-2 py-1 text-xs">{tag}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={clsx({ "hidden": activeIndex !== index }, "flex flex-col gap-2")}>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="title" className="font-semibold">Title:</label>
                    <input
                      onChange={event => updateInput(event, 'title', index)}
                      className="border border-gray-300 rounded w-full h-8 px-2 py-1 outline-0 bg-transparent"
                      name="title"
                      value={videos[activeIndex]?.title}
                    />
                    {keyReferenceAddButton(activeIndex, "title", videos)}
                    {hasKey("title") && keyReferenceMenu("title")}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="description" className="font-semibold">Description:</label>
                    <textarea
                      name="description"
                      className="border border-gray-300 outline-0 w-full h-12 px-2 py-1 rounded bg-transparent"
                      onChange={event => updateInput(event, 'description', index)}
                      value={videos[activeIndex]?.description}
                    />
                    {keyReferenceAddButton(activeIndex, "description", videos)}
                    {hasKey("description") && keyReferenceMenu("description")}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="category" className="font-semibold">Category:</label>
                    <select
                      onChange={event => updateInput(event, 'categoryId', index)}
                      className="outline-0 border-0 bg-transparent rounded"
                      name="category"
                      value={videos[activeIndex]?.categoryId}
                    >
                      {Categories.map((item: CategoriesType) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="scheduleDate" className="font-semibold">Scheduled Date:</label>
                    <input
                      type="date"
                      onChange={event => updateInput(event, 'scheduleDate', index)}
                      className="border-0 outline-0 bg-transparent"
                      name="scheduleDate"
                      value={videos[activeIndex]?.scheduleDate}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="tags" className="font-semibold">Tags:</label>
                    <textarea
                      name="tags"
                      className="border border-gray-300 rounded w-full h-8 px-2 py-1 outline-0 bg-transparent "
                      onChange={event => updateInput(event, 'tags', index)}
                      value={videos[activeIndex]?.tags}
                    />
                    {keyReferenceAddButton(activeIndex, "tags", videos)}
                    {hasKey("tags") && keyReferenceMenu("tags")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!!videos.length && (
          <div className="flex flex-col items-center mb-10">
            <Button
              variant="secondary"
              type="submit"
              onClick={onSubmit}
            >
              {`Upload ${videos.length} Video${videos.length > 1 ? 's' : ''
                } to YouTube`}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
