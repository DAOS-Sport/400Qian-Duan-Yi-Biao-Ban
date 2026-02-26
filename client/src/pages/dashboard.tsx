import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Layers, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

const kpiData = [
  {
    title: "活躍群組數",
    value: 9,
    suffix: "",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
  {
    title: "總啟用功能數",
    value: 27,
    suffix: "",
    icon: Layers,
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
  },
  {
    title: "系統健康度",
    value: 98,
    suffix: "%",
    icon: Activity,
    gradient: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-500",
  },
];

const barChartData = [
  { name: "新北高中", tasks: 1, weather: 0, gps: 1, survey: 1, water: 0, wind: 0 },
  { name: "台中一中", tasks: 1, weather: 1, gps: 1, survey: 1, water: 0, wind: 1 },
  { name: "高雄女中", tasks: 1, weather: 1, gps: 0, survey: 1, water: 1, wind: 0 },
  { name: "花蓮高中", tasks: 1, weather: 0, gps: 1, survey: 0, water: 1, wind: 1 },
  { name: "台南二中", tasks: 1, weather: 1, gps: 1, survey: 1, water: 0, wind: 0 },
  { name: "桃園高中", tasks: 1, weather: 0, gps: 0, survey: 1, water: 1, wind: 1 },
  { name: "嘉義高中", tasks: 1, weather: 1, gps: 1, survey: 0, water: 0, wind: 0 },
  { name: "宜蘭高中", tasks: 1, weather: 0, gps: 1, survey: 1, water: 0, wind: 1 },
  { name: "屏東高中", tasks: 1, weather: 1, gps: 0, survey: 0, water: 1, wind: 0 },
];

const featureColors: Record<string, string> = {
  tasks: "#3b82f6",
  weather: "#10b981",
  gps: "#8b5cf6",
  survey: "#f59e0b",
  water: "#06b6d4",
  wind: "#ec4899",
};

const featureLabels: Record<string, string> = {
  tasks: "任務交辦",
  weather: "氣象觀測",
  gps: "GPS 定位",
  survey: "客戶調查",
  water: "水質監控",
  wind: "風力監測",
};

const donutData = [
  { name: "任務交辦", value: 100, color: "#3b82f6" },
  { name: "客戶調查", value: 67, color: "#f59e0b" },
  { name: "水質監控", value: 11, color: "#06b6d4" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function KpiCard({
  item,
  index,
}: {
  item: (typeof kpiData)[0];
  index: number;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="flex-1 min-w-[200px]"
    >
      <Card className="p-5 cursor-default border-card-border hover-elevate" data-testid={`card-kpi-${index}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
            <p className="text-3xl font-bold tracking-tight" data-testid={`text-kpi-value-${index}`}>
              {item.value}
              {item.suffix}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${item.lightBg}`}
          >
            <Icon className={`h-6 w-6 ${item.iconColor}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {featureLabels[entry.dataKey]}:
          </span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function StackedBarChartSection() {
  return (
    <motion.div variants={cardVariants}>
      <Card className="p-6 border-card-border" data-testid="card-stacked-bar-chart">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">各群組功能啟用概況</h2>
          <p className="text-sm text-muted-foreground mt-1">
            依群組分類的功能啟用堆疊分析
          </p>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={barChartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">
                  {featureLabels[value] || value}
                </span>
              )}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 16 }}
            />
            {Object.entries(featureColors).map(([key, color]) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="features"
                fill={color}
                radius={key === "wind" ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

function DonutChart({
  item,
  index,
}: {
  item: (typeof donutData)[0];
  index: number;
}) {
  const remaining = 100 - item.value;
  const data = [
    { name: item.name, value: item.value },
    { name: "remaining", value: remaining },
  ];

  return (
    <motion.div variants={cardVariants} className="flex-1 min-w-[200px]">
      <Card className="p-5 border-card-border flex flex-col items-center" data-testid={`card-donut-${index}`}>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {item.name}
        </p>
        <div className="relative">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={item.color} />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: item.color }}
              data-testid={`text-donut-value-${index}`}
            >
              {item.value}%
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {item.value === 100
            ? "全數群組已啟用"
            : `${Math.round((item.value / 100) * 9)} / 9 群組已啟用`}
        </p>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            群組功能戰情室
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            即時監控各群組的功能啟用狀態與系統健康度
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {kpiData.map((item, i) => (
            <KpiCard key={item.title} item={item} index={i} />
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StackedBarChartSection />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold">關鍵功能滲透率</h2>
            <p className="text-sm text-muted-foreground mt-1">
              核心功能在各群組中的啟用比例
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {donutData.map((item, i) => (
              <DonutChart key={item.name} item={item} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
