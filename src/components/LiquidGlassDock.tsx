import { GlassDock, GlassFilter } from '@/components/ui/liquid-glass';

const dockIcons = [
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/a13d1acfd046f503f987c1c95af582c8_low_res_Claude.png",
    alt: "Claude",
    onClick: (index: number) => {},
  },
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/9e80c50a5802d3b0a7ec66f3fe4ce348_low_res_Finder.png",
    alt: "Finder",
    onClick: (index: number) => {},
  },
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/c2c4a538c2d42a8dc0927d7d6530d125_low_res_ChatGPT___Liquid_Glass__Default_.png",
    alt: "Chatgpt",
    onClick: (index: number) => {},
  },
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/6d26d432bd65c522b0708185c0768ec3_low_res_Maps.png",
    alt: "Maps",
    onClick: (index: number) => {},
  },
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/7c59c945731aecf4f91eb8c2c5f867ce_low_res_Safari.png",
    alt: "Safari",
    onClick: (index: number) => {},
  },
  {
    src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/b7f24edc7183f63dbe34c1943bef2967_low_res_Steam___Liquid_Glass__Default_.png",
    alt: "Steam",
    onClick: (index: number) => {},
  },
];

interface LiquidGlassDockProps {
  onIconClick: (index: number) => void;
  activeIcon: number;
}

export function LiquidGlassDock({ onIconClick, activeIcon }: LiquidGlassDockProps) {
  const iconsWithHandlers = dockIcons.map((icon, index) => ({
    ...icon,
    onClick: () => onIconClick(index),
  }));

  return (
    <>
      <GlassFilter />
      <div className='absolute bottom-2 left-1/2 max-w-full -translate-x-1/2 z-50'>
        <GlassDock icons={iconsWithHandlers} activeIndex={activeIcon} />
      </div>
    </>
  );
}