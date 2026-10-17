import React from 'react';
import { Home, ShoppingBag, Film, Tag, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onNavigate
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'budget', label: 'Under ₹499', icon: Tag },
    { id: 'about', label: 'Priya', icon: Sparkles }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0E4DC] px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#743D4A] font-bold' : 'text-stone-500 hover:text-[#743D4A]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'bg-[#FFF0F2] scale-110' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#743D4A]' : 'text-stone-500'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
