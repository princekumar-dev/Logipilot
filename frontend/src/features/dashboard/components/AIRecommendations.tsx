'use client';

import { useState, useEffect } from 'react';
import { Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import analyticsService, { Recommendation } from '@/services/analytics.service';

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    analyticsService.getRecommendations({ limit: 10, status: 'pending' })
      .then((res) => { if (!cancelled) setRecommendations(res.recommendations); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-[14px] border border-[#dddddd] h-full relative overflow-hidden bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-[#dddddd] bg-white relative z-10 flex items-center justify-between">
        <h2 className="text-base font-bold flex items-center gap-2.5 text-[#222222] tracking-tight">
          <div className="p-1.5 rounded-lg text-[#222222]">
            <Bot className="w-5 h-5" strokeWidth={2} />
          </div>
          AI Intelligence
        </h2>
        <div className="flex items-center gap-2 border border-[#dddddd] bg-[#f7f7f7] px-3 py-1.5 rounded-full">
           <span className="w-2 h-2 bg-[#008a05] rounded-full animate-pulse" />
           <span className="text-[12px] font-bold text-[#222222]">Active</span>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-32 rounded-[14px] bg-[#f7f7f7] animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-[#6a6a6a] text-[14px]">
            No pending recommendations
          </div>
        ) : (
          <div className="space-y-4 [&>div]:transition-all">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="group bg-white border border-[#dddddd] rounded-[14px] p-5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-current opacity-100 transition-opacity" style={{ color: rec.priority === 'high' || rec.priority === 'urgent' ? '#ff385c' : '#222222' }} />

                <div className="flex justify-between items-start mb-2 pl-2">
                  <h4 className="font-bold text-[14px] text-[#222222]">
                    {rec.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wide ${rec.priority === 'high' || rec.priority === 'urgent' ? 'text-[#c13515] bg-[#fff8f6]' : 'text-[#222222] bg-[#f7f7f7]'}`}>
                    {rec.priority}
                  </span>
                </div>

                <p className="text-[14px] font-normal text-[#6a6a6a] mb-5 pl-2 leading-relaxed">
                  {rec.message}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#dddddd] pl-2 mt-auto">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#008a05]">
                    <Zap className="w-4 h-4 fill-current" />
                    {rec.expectedTimeSavedMinutes ? `Saves ${rec.expectedTimeSavedMinutes} mins` : 'Optimization available'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success(`Action Applied`, { description: `Fix for "${rec.title}" is being processed.` })}
                    className="h-8 px-4 text-[14px] font-bold text-[#222222] hover:bg-[#f7f7f7] rounded-[8px] group-hover:bg-primary group-hover:text-white transition-all border border-transparent group-hover:border-primary"
                  >
                    Apply Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
