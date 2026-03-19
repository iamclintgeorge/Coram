import { CheckCircle, Cpu, Server, Activity, RefreshCw } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <div
    className={`relative overflow-hidden rounded-xl p-6 text-black shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-gray-500 border-2`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white/10 blur-2xl" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-gray-100 backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm font-medium text-black mb-1">{title}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-black mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;
