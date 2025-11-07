interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

interface ProjectStatsProps {
  stats: Stat[];
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg border ${
            stat.color || "border-gray-200"
          } p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
