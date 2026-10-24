import React from "react";
import { AlertOctagon, CheckCircle2, RotateCcw, X } from "lucide-react";
import { RestorationReport } from "../types";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  report: RestorationReport | null;
  isRestoring: boolean;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  report,
  isRestoring,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-rose-500/30 p-6 shadow-2xl glow-rose relative bg-[#0f172a]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Emergency System Restore</h3>
            <p className="text-xs text-slate-400">
              Immediate unconditional rollback of all modified settings
            </p>
          </div>
        </div>

        {report ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Restoration Completed Successfully</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">{report.notes}</p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              {report.restored_items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-emerald-400">
                  <span>✓</span>
                  <span>{item}</span>
                </div>
              ))}
              {report.failed_items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-rose-400">
                  <span>✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Tikomizer will load the persistent recovery journal and immediately restore:
            </p>

            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <li>Original Windows Power Policy Scheme GUID</li>
              <li>Default Multimedia Timer Resolution (15.6ms)</li>
              <li>Pointer speed and hardware mouse acceleration curves</li>
              <li>Original priority classes and processor affinity masks for all processes</li>
              <li>Purge active session locks and clear recovery journal</li>
            </ul>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isRestoring}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? "animate-spin" : ""}`} />
                <span>{isRestoring ? "Restoring Windows State..." : "Execute Immediate Restore"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
