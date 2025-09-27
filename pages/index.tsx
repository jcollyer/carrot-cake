import Button from "@/app/components/primitives/Button";
import FeatureCard from "@/app/components/FeatureCard";
import VerticalCarousel from "@/app/components/VerticalCarousel";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react"

const slides = [
  <div className="flex gap-3 items-center">
    <Image src="/youtube_logo.png" alt="Carrot Cake Logo" width="20" height="2" className="h-[15px]" />
    <h3 className="font-bold text-gray-600">Youtube </h3>
  </div>,
  <div className="flex gap-3 items-center">
    <Image src="/tiktok.svg" alt="TikTok Logo" width="20" height="6" />
    <h3 className="font-bold text-gray-600">TikTok</h3>
  </div>,
  <div className="flex gap-2 items-center">
    <Image src="/ig_logo.svg" alt="Instagram Logo" width="20" height="6" />
    <h3 className="font-bold text-gray-600">Instagram</h3>
  </div>,
  <div className="flex gap-3 items-center">
    <Image src="/youtube_logo.png" alt="Carrot Cake Logo" width="20" height="2" className="h-[15px]" />
    <h3 className="font-bold text-gray-600">Youtube </h3>
  </div>,
  <div className="flex gap-3 items-center">
    <Image src="/tiktok.svg" alt="TikTok Logo" width="20" height="6" />
    <h3 className="font-bold text-gray-600">TikTok</h3>
  </div>,
  <div className="flex gap-2 items-center">
    <Image src="/ig_logo.svg" alt="Instagram Logo" width="20" height="6" />
    <h3 className="font-bold text-gray-600">Instagram</h3>
  </div>,
  <div className="flex gap-3 items-center">
    <Image src="/youtube_logo.png" alt="Carrot Cake Logo" width="20" height="2" className="h-[15px]" />
    <h3 className="font-bold text-gray-600">Youtube </h3>
  </div>,
];

function LoggedOut() {
  const { data: session } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (session) {
      push("/home");
    }
  }, [session]);

  return (
    <main className="w-full bg-gray-500">
      <div className="flex justify-center w-full bg-white">
        <div className="flex flex-col gap-4 items-center py-24 px-64">
          <h1 className="text-2xl text-transparent text-center leading-[1.2] bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">CARROT CAKE APP</h1>
          <div className="flex gap-1 items-center">
            <h3 className="font-bold tracking-wide text-gray-600">Schedule all or your</h3>
            <VerticalCarousel slides={slides} />
            <h3 className="font-bold tracking-wide text-gray-600">in one app</h3>
          </div>
          <h1 className="text-5xl text-transparent text-center leading-[1.2] bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">upload once, schedule for weeks</h1>
          <h2 className="text-xl text-center px-32">Save time. Stay organized. Upload multiple videos at once and manage them effortlessly.</h2>
        </div>
      </div>
      <div className="w-full pb-36 bg-gray-100">
        <div className="max-w-4xl flex flex-col gap-8 m-auto">
          <h3 className="text-2xl text-center font-semibold mt-28 mb-4 text-gray-600">Key Features Include:</h3>
          <div className="flex gap-4 px-8">
            <FeatureCard icon="Rocket" title="Bulk Uploads Made Simple" description="Say goodbye to one-by-one uploads. Schedule multiple videos in a single go!" />
            <FeatureCard icon="Goal" title="One-Click YouTube & TikTok Integration" description="Connect your YouTube channel in seconds and manage your content like a pro." />
            <FeatureCard icon="Calendar" title="Interactive Scheduling Calendar" description="See all your past and upcoming videos in one place. Drag, drop, and edit with ease!" />
          </div>
          <div className="flex gap-4 px-8">
            <FeatureCard icon="PencilRuler" title="Quick & Easy Video Edits" description="Need to make changes? Click on a scheduled video and tweak details on the fly." />
            <FeatureCard icon="Bell" title="Never Miss a Post Again" description="Stay on top of your content strategy with automatic scheduling and reminders." />
            <FeatureCard icon="ChartColumnBig" title="Track & Manage with Ease" description="View all your uploaded and scheduled videos in a simple, interactive dashboard." />
          </div>
          <div className="max-w-md flex flex-col gap-1 m-auto mt-12">
            <h3 className="text-2xl text-center font-semibold mt-10 text-gray-600">Start Scheduling Smarter Today!</h3>
            <p className="text-center px-16 leading-[2] mb-8">Sign up now and take control of your YouTube content like never before.</p>
            <Button
              variant="cta"
              onClick={() => signIn()}
              className="m-auto"
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoggedOut;