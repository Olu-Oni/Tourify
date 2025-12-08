import { IFeature } from "../interfaces/features.interface";
import { LuSparkles, LuTarget, LuRocket } from "react-icons/lu";
import { AiOutlineBarChart } from "react-icons/ai";
import { FiZap } from "react-icons/fi";
import { IoCodeSharp } from "react-icons/io5";

export const features: IFeature[] = [
  {
    icon: <LuSparkles className="w-6 h-6" />,
    title: "Beautiful Tours",
    description:
      "Create stunning onboarding experiences with smooth animations and modern design",
  },
  {
    icon: <LuTarget className="w-6 h-6" />,
    title: "Precise Targeting",
    description: "Highlight any element on your page with CSS selectors",
  },
  {
    icon: <AiOutlineBarChart className="w-6 h-6" />,
    title: "Analytics Built-in",
    description: "Track completion rates, drop-offs, and user engagement",
  },
  {
    icon: <FiZap className="w-6 h-6" />,
    title: "Lightning Fast",
    description: "Tiny bundle size with zero impact on page performance",
  },
  {
    icon: <IoCodeSharp className="w-6 h-6" />,
    title: "Easy Integration",
    description: "Add to any website with just 2 lines of code",
  },
  {
    icon: <LuRocket className="w-6 h-6" />,
    title: "No Code Required",
    description: "Visual editor makes tour creation simple for everyone",
  },
];
