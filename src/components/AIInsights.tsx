import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, TrendingUp, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface AIInsightsProps {
  isJam: boolean;
  recommendation: string;
  loading: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ isJam, recommendation, loading }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-slate-800">AI Predictive Insights</h2>
        </div>
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Clock className="w-4 h-4 text-slate-400" />
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
          </motion.div>
        ) : recommendation ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-xl border",
              isJam ? "bg-red-50 border-red-100 text-red-800" : "bg-green-50 border-green-100 text-green-800"
            )}>
              {isJam ? (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {isJam ? "Congestion Predicted" : "Clear Route Forecasted"}
                </p>
                <p className="text-xs opacity-80">
                  {isJam ? "Expect delays within 30 minutes." : "Route is expected to remain clear."}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{recommendation}"
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            Enter a destination to see AI predictions
          </p>
        )}
      </AnimatePresence>
    </div>
  );
};
