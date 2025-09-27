import { Rocket, Goal, Calendar, PencilRuler, Bell, ChartColumnBig } from "lucide-react";

type IconType = "Rocket" | "Goal" | "Calendar" | "PencilRuler" | "Bell" | "ChartColumnBig";

const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: IconType }) => {
  const iconMap = {
    "Rocket": <Rocket size={18} className="text-white" />,
    "Goal": <Goal size={18} className="text-white" />,
    "Calendar": <Calendar size={18} className="text-white" />,
    "PencilRuler": <PencilRuler size={18} className="text-white" />,
    "Bell": <Bell size={18} className="text-white" />,
    "ChartColumnBig": <ChartColumnBig size={18} className="text-white" />,
  }
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 pt-4 pb-6 rounded-md drop-shadow bg-white">
      <div className="flex items-center gap-3">
        <div className="rounded-full p-2 bg-orange-600">
          {iconMap[icon]}
        </div>
        <h4 className="text-lg font-semibold text-gray-600">{title}</h4>
      </div>
      <p className="text-sm">{description}</p>
    </div>
  )
};

export default FeatureCard;