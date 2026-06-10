'use client';

import { FolderX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon = <FolderX className="w-12 h-12 text-slate-300" />
}: EmptyStateProps) {
  return (
    <div className="w-full h-full min-h-[300px] rounded-3xl border border-slate-200 border-dashed bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm font-medium text-slate-500 max-w-[300px] mx-auto mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-slate-900 text-white rounded-xl h-10 px-6 font-bold shadow-md hover:bg-slate-800">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
