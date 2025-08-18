import {
  Palette,
  Sparkles,
  Home,
  Mail,
  User,
  Camera,
  Heart,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

const data = [
  {
    title: 'Início',
    icon: (
      <Home className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Galeria',
    icon: (
      <Camera className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Arte',
    icon: (
      <Palette className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Efeitos',
    icon: (
      <Sparkles className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Perfil',
    icon: (
      <User className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Favoritos',
    icon: (
      <Heart className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
  {
    title: 'Contato',
    icon: (
      <Mail className='h-full w-full text-white/80 hover:text-white transition-colors' />
    ),
    href: '#',
  },
];

export function AppleStyleDock() {
  return (
    <div className='absolute bottom-6 left-1/2 max-w-full -translate-x-1/2 z-50'>
      <Dock className='items-end pb-3 backdrop-blur-md bg-white/10 border border-white/20'>
        {data.map((item, idx) => (
          <DockItem
            key={idx}
            className='aspect-square rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300'
          >
            <DockLabel className='bg-black/80 text-white border-white/20'>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}