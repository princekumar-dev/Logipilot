'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CopilotPage() {
  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
               <Bot className="w-5 h-5" />
            </div>
            AI Copilot
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Your intelligent assistant for logistics routing and problem solving.</p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 24 }}
        className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex mt-2"
      >
        {/* Chat History Sidebar */}
        <div className="w-72 border-r border-slate-100 bg-slate-50/50 p-4 hidden md:flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-2">Recent Sessions</h3>
          <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 text-sm font-bold text-slate-900 cursor-pointer flex items-center gap-3 group">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><MessageSquare className="w-4 h-4" /></div> Today&apos;s Routing
          </div>
          <div className="p-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100/80 cursor-pointer flex items-center gap-3 transition-colors group">
            <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-600"><MessageSquare className="w-4 h-4" /></div> Delay Prediction
          </div>
          <div className="p-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100/80 cursor-pointer flex items-center gap-3 transition-colors group">
            <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-600"><MessageSquare className="w-4 h-4" /></div> Fleet Check
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-white/95 backdrop-blur-[1px] z-0" />
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10 relative">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl rounded-tl-sm text-sm text-slate-700">
                <p className="font-bold text-blue-600 mb-3 flex items-center gap-1.5 uppercase tracking-wide text-xs"><Sparkles className="w-3.5 h-3.5" /> LogiPilot AI</p>
                <p className="font-medium text-base leading-relaxed">I&apos;ve analyzed the Chennai-Bangalore route for today. TomTom traffic data indicates a major blockade near Krishnagiri due to roadwork.</p>
                <p className="mt-3 font-medium text-base leading-relaxed">I recommend rerouting fleet groups A and B through the alternate state highway. This will add 15km to the journey but save approximately 45 minutes of idling time.</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-4 max-w-3xl ml-auto justify-end">
              <div className="bg-slate-900 text-white shadow-md p-5 rounded-2xl rounded-tr-sm text-sm">
                <p className="font-medium text-base leading-relaxed">Apply the reroute for fleet group A only. Let&apos;s see how traffic evolves.</p>
              </div>
              <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                 <AvatarFallback className="bg-slate-100 text-slate-900 font-bold">AM</AvatarFallback>
              </Avatar>
            </motion.div>
            
          </div>

          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-10 relative">
            <div className="max-w-4xl mx-auto flex gap-3 relative">
              <Input 
                placeholder="Ask about delays, rerouting, or driver performance..." 
                className="flex-1 h-12 pl-4 pr-12 rounded-2xl shadow-sm border-slate-200 bg-white font-medium focus-visible:ring-blue-500 text-base"
              />
              <Button size="icon" className="h-10 w-10 rounded-xl absolute right-1 top-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-xs font-medium text-slate-400 mt-3">LogiPilot AI can make mistakes. Verify critical routing changes.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
