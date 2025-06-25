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
import { TikTokVideoProps } from '@/types/video'
import generateVideoThumb from '@/app/utils/generateVideoThumb';
import moment from 'moment';

export const getServerSideProps = async (context: any) => {
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
      email: session?.user?.email,
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

const privacyStatusOptions = [
  { id: 'PUBLIC_TO_EVERYONE', label: 'Public to Everyone' },
  { id: 'MUTUAL_FOLLOW_FRIENDS', label: 'Mutual Follow Friends' },
  { id: 'FOLLOWER_OF_CREATOR', label: 'Follower of Creator' },
  { id: 'SELF_ONLY', label: 'Unlisted' },
]

export default function UploadTikTokPage({ references }: { references: Reference[] }) {
  const tokens = getCookie('tokens');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [allActive, setAllActive] = useState<boolean>(false);
  const [video, setVideo] = useState<TikTokVideoProps>();
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [disclose, setDisclose] = useState<boolean>(false);
  const [yourBrand, setYourBrand] = useState<boolean>(true);
  const [brandedContent, setBrandedContent] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any) => {
        const thumbnail = await generateVideoThumb(file);

        setVideo({
          file,
          thumbnail: thumbnail || transparentImage,
          title: file.name,
          description: '',
          privacyStatus: '',
          scheduleDate: new Date().toISOString(),
          interactionType: {
            allowComments: false,
            allowDuet: false,
            allowStitch: false,
          },
          commercialUse: false,
        });
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // const tryToUpload = async (accessToken: string, urlparameters: string, video: TikTokVideoProps) => {
  //   try {
  //     const location = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?${urlparameters}`, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${String(accessToken)}`,
  //       },
  //       body: JSON.stringify({
  //         snippet: {
  //           // privacyStatus: video.privacyStatus,
  //           description: video.description,
  //           title: video.title,
  //           // tags: video.tags?.split(', '), // Array of strings
  //         },
  //         status: {
  //           privacyStatus: 'private',
  //           publishAt: new Date(video.scheduleDate).toISOString(),
  //         },
  //       }),
  //     });
  //     // Url to upload video file from the location header
  //     const videoUrl = await location.headers.get('Location');
  //     try {
  //       const response = await fetch(`${videoUrl}`, {
  //         method: 'PUT',
  //         headers: {
  //           'Content-Type': 'video/mp4',
  //         },
  //         body: video.file,
  //       });
  //       setVideo([]);
  //     } catch (error) {
  //       console.error('Error uploading file:', error);
  //     }
  //   } catch {
  //     // If the access token is expired, refresh it and try again
  //     try {
  //       const refreshToken = JSON.parse(tokens as string)?.refresh_token;
  //       const refreshResponse = await fetch('/api/youtube/connect-yt', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ refreshToken }),
  //       });

  //       if (!refreshResponse) {
  //         console.error('No refresh response');
  //         return;
  //       }
  //       const refreshData = await refreshResponse.json();
  //       const config = refreshData?.res?.config;
  //       const { url, body, headers } = config;

  //       await fetch(url, {
  //         method: 'POST',
  //         headers,
  //         body,
  //       }).then(async (res) => {
  //         const { access_token } = await res.json();
  //         // Try uploading the video again with the new access token
  //         await tryToUpload(access_token, urlparameters, video);
  //       });
  //     } catch (error) {
  //       console.error('Error refreshing token:', error);
  //     }
  //   }
  // }

  const onSubmit = async (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;
    const urlparameters = 'part=snippet%2Cstatus&uploadType=resumable';

    if (!accessToken) {
      console.error('No access token found');
      return;
    }
    if (!!video) {
      // videos.forEach(async (video) => tryToUpload(accessToken, urlparameters, video));
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
    setVideo((prevVideo) => {
      if (!prevVideo) return prevVideo;
      return {
        ...prevVideo,
        [key]: value,
      };
    });
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

  const keyReferenceAddButton = (keyName: string, video: any) => {
    const showButton = !!video[keyName] && video[keyName] !== "" && isNewReference(video[keyName]);
    return showButton ? (
      <>
        <button
          type="button"
          onClick={() => setReferencePost(video[keyName], keyName)}
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

        <div className="mt-2 mb-5">
          {!!video && (
            <div className={clsx({ "border-gray-800": false }, "flex flex-row py-2 border-b border-gray-400")}>
              <div className={clsx({ "border-gray-800": false }, "max-w-44 pr-2 border-r border-gray-400")}>
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
                      onChange={event => setVideo({
                        ...video,
                        // thumbnail: URL.createObjectURL(event.target.files[0]),
                      })}
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
              <div className="flex-row grow pl-2">


                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <label htmlFor="title" className="font-semibold">Title:</label>
                    <input
                      onChange={event => setVideo({ ...video, title: event.currentTarget.value })}
                      className="border border-gray-300 rounded w-full h-8 px-2 py-1 outline-0 bg-transparent"
                      name="title"
                      value={video.title}
                    />
                    {keyReferenceAddButton("title", video)}
                    {hasKey("title") && keyReferenceMenu("title")}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="description" className="font-semibold">Description:</label>
                    <textarea
                      name="description"
                      className="border border-gray-300 outline-0 w-full h-12 px-2 py-1 rounded bg-transparent"
                      onChange={event => setVideo({ ...video, description: event.currentTarget.value })}
                      value={video?.description}
                    />
                    {keyReferenceAddButton("description", video)}
                    {hasKey("description") && keyReferenceMenu("description")}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="category" className="font-semibold">Who can view this video: </label>
                    <select
                      onChange={event => setVideo({ ...video, privacyStatus: event.currentTarget.value })}
                      className="outline-0 border-0 bg-transparent rounded"
                      name="category"
                      value={video.privacyStatus}
                    >
                      <option label="select an option"></option>
                      {privacyStatusOptions.map((item) =>
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Allow users to: </p>
                    <div>
                      <div className="flex gap-2">
                        <label htmlFor="category">Comment:</label>
                        <input type="checkbox" />
                      </div>
                      <div className="flex gap-2">
                        <label htmlFor="category">Duet:</label>
                        <input type="checkbox" />
                      </div>
                      <div className="flex gap-2">
                        <label htmlFor="category">Stitch:</label>
                        <input type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={event => {
                          setDisclose(event.target.checked);
                          setVideo({
                            ...video,
                            commercialUse: event.target.checked,
                          });
                          if (!event.target.checked) {
                            setYourBrand(false);
                            setBrandedContent(false);
                          } else {
                            setYourBrand(true);
                          }
                        }}
                        checked={(disclose && yourBrand) || (disclose && brandedContent)}
                      />
                      <p className="font-semibold">Disclose video content:</p>
                    </div>
                    {disclose && (
                      <div className="bg-blue-100 text-blue-900 text-sm p-3 rounded mb-1">
                        Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>

                    {disclose && (
                      <div className="flex flex-col gap-2 p-4">
                        <div className="mb-3">
                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={yourBrand}
                              onChange={() => setYourBrand(!yourBrand)}
                              className="mt-1"
                            />
                            <div>
                              <p className="font-medium">Your brand</p>
                              <p className="text-sm text-gray-600">
                                You are promoting yourself or your own business. This video will be classified as Brand Organic.
                              </p>
                            </div>
                          </label>
                        </div>

                        <div className="mb-3">
                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={brandedContent}
                              onChange={() => setBrandedContent(!brandedContent)}
                              className="mt-1"
                            />
                            <div>
                              <p className="font-medium">Branded content</p>
                              <p className="text-sm text-gray-600">
                                You are promoting another brand or a third party. This video will be classified as Branded Content.
                              </p>
                            </div>
                          </label>
                        </div>

                        {(yourBrand || brandedContent) && (
                          <p className="text-sm text-gray-600 mb-4">
                            By posting, you agree to TikTok's{" "}

                            {brandedContent && (
                              <>
                                <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" className="text-blue-600 underline">
                                  Branded Content Policy{" "}
                                </a>
                                and{" "}
                              </>
                            )}
                            <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" className="text-blue-600 underline">Music Usage Confirmation</a>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!!video && (
          <div className="flex flex-col items-center mb-10">
            <Button
              variant="secondary"
              type="submit"
              onClick={onSubmit}
            >
              Upload Video to TikTok
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
