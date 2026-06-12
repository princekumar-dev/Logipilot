'use client';

import { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function SkeletonBubble({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={`flex gap-3 ${align === 'right' ? 'justify-end' : ''}`}>
      {align === 'left' && (
        <Avatar className="h-8 w-8 bg-white border border-[#dddddd]">
          <AvatarFallback className="text-[#222222] bg-white"><Bot className="w-4 h-4" strokeWidth={2} /></AvatarFallback>
        </Avatar>
      )}
      <div className={`${align === 'right' ? 'bg-primary' : 'bg-white border border-[#dddddd]'} p-4 rounded-[16px] ${align === 'right' ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'} space-y-2`}>
        <div className={`h-3 rounded ${align === 'right' ? 'bg-white/30' : 'bg-[#f7f7f7]'} animate-pulse w-48`} />
        <div className={`h-3 rounded ${align === 'right' ? 'bg-white/30' : 'bg-[#f7f7f7]'} animate-pulse w-32`} />
      </div>
    </div>
  );
}

export function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !loading) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 h-14 w-14 rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.12)] bg-[#222222] text-white hover:bg-black transition-all z-[90] hover:scale-105"
      >
        <Bot className="w-6 h-6" strokeWidth={2} />
      </Button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-[100] md:hidden" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] top-0 md:top-auto bottom-0 bg-white md:border md:border-[#dddddd] md:rounded-[24px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] flex flex-col z-[110] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#dddddd] bg-white">
        <div className="flex items-center gap-2 text-[#222222]">
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="font-bold text-[16px] text-[#222222] tracking-tight">LogiPilot Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-[#6a6a6a] hover:text-[#222222] transition-colors p-1.5 rounded-full hover:bg-[#f7f7f7]">
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <ScrollArea className="flex-1 p-5 bg-[#f7f7f7]">
        <div className="space-y-6">
          {loading ? (
            <>
              <SkeletonBubble align="left" />
              <SkeletonBubble align="right" />
              <SkeletonBubble align="left" />
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-white border border-[#dddddd]">
                   <AvatarFallback className="text-[#222222] bg-white"><Bot className="w-4 h-4" strokeWidth={2} /></AvatarFallback>
                </Avatar>
                <div className="bg-white border border-[#dddddd] shadow-[0_2px_4px_rgba(0,0,0,0.04)] p-4 rounded-[16px] rounded-tl-[4px] text-[14px] text-[#222222]">
                  LogiPilot AI initialized. How can I assist you with logistics today?
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-white shadow-[0_2px_4px_rgba(0,0,0,0.04)] p-4 rounded-[16px] rounded-tr-[4px] text-[14px] font-medium">
                  Which shipments are at risk today?
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-white border border-[#dddddd]">
                   <AvatarFallback className="text-[#222222] bg-white"><Bot className="w-4 h-4" strokeWidth={2} /></AvatarFallback>
                </Avatar>
                <div className="bg-white border border-[#dddddd] shadow-[0_2px_4px_rgba(0,0,0,0.04)] p-4 rounded-[16px] rounded-tl-[4px] text-[14px] text-[#222222] space-y-2">
                  <p>Scanning active routes...</p>
                  <p>Found <span className="text-primary font-bold">3 critical</span> shipments:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[#6a6a6a]">
                    <li>LP100045 (Traffic delay)</li>
                    <li>LP100291 (Weather warning)</li>
                    <li>LP100833 (Vehicle maintenance)</li>
                  </ul>
                  <p className="pt-2 text-[14px] font-bold text-[#222222]">Would you like me to reroute them?</p>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#dddddd] bg-white">
        <div className="relative flex items-center">
          <input
            className="w-full pr-12 pl-4 py-3 rounded-full border border-[#dddddd] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent bg-white text-[#222222] text-[14px] placeholder-[#6a6a6a]"
            placeholder="Ask anything..."
          />
          <button className="absolute right-2 p-2 rounded-full text-white bg-primary hover:bg-black transition-colors">
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
