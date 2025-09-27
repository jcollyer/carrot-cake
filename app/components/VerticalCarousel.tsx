import { cn } from "@/app/utils/cn";
import { useEffect, useState } from "react";

const VerticalCarousel = ({ slides }: { slides: React.ReactNode[] }) => {
  const [logoIndex, setLogoIndex] = useState(0);

  const goToNextLogo = () => {
    setLogoIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }

  useEffect(() => {
    const interval = setInterval(goToNextLogo, 2000);
    return () => clearInterval(interval);
  }, [])
  return (
    <div className="relative overflow-hidden h-6 px-1">
      <div
        className={cn("flex flex-col transition-transform duration-500 ease-in-out", {
          "duration-0": logoIndex === 0,
        })}
        style={{ transform: `translateY(-${logoIndex * 24}px)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full flex items-center justify-center">
            {slide}
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerticalCarousel;