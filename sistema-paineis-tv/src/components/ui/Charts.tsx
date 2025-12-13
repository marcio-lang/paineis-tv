import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartProps {
  data: any[];
  className?: string;
  height?: number;
  colors?: string[];
  animate?: boolean;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 mr-2">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Area Chart Component
export const AreaChartComponent: React.FC<ChartProps & { 
  dataKey: string; 
  gradient?: boolean;
  strokeWidth?: number;
}> = ({ 
  data, 
  dataKey, 
  className = '', 
  height = 300, 
  colors = ['#3B82F6'], 
  animate = true,
  gradient = true,
  strokeWidth = 2
}) => {
  const gradientId = `gradient-${dataKey}`;
  
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {gradient && (
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={colors[0]}
            strokeWidth={strokeWidth}
            fill={gradient ? `url(#${gradientId})` : colors[0]}
            animationDuration={animate ? 1000 : 0}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart Component
export const BarChartComponent: React.FC<ChartProps & { 
  dataKey: string;
  barRadius?: number;
}> = ({ 
  data, 
  dataKey, 
  className = '', 
  height = 300, 
  colors = ['#3B82F6'], 
  animate = true,
  barRadius = 4
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={dataKey} 
            fill={colors[0]}
            radius={[barRadius, barRadius, 0, 0]}
            animationDuration={animate ? 1000 : 0}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Line Chart Component
export const LineChartComponent: React.FC<ChartProps & { 
  dataKey: string;
  strokeWidth?: number;
  dot?: boolean;
}> = ({ 
  data, 
  dataKey, 
  className = '', 
  height = 300, 
  colors = ['#3B82F6'], 
  animate = true,
  strokeWidth = 2,
  dot = true
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={colors[0]}
            strokeWidth={strokeWidth}
            dot={dot ? { fill: colors[0], strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2, fill: '#fff' }}
            animationDuration={animate ? 1000 : 0}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
export const PieChartComponent: React.FC<ChartProps & {
  dataKey: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}> = ({ 
  data, 
  dataKey,
  nameKey = 'name',
  className = '', 
  height = 300, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], 
  animate = true,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = true
}) => {
  const renderLabel = (entry: any) => {
    if (!showLabels) return '';
    const percent = ((entry.value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(1);
    return `${entry[nameKey]} (${percent}%)`;
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderLabel : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            animationDuration={animate ? 1000 : 0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLabels && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Multi-line Chart Component
export const MultiLineChart: React.FC<{
  data: any[];
  lines: { dataKey: string; name: string; color: string }[];
  className?: string;
  height?: number;
  animate?: boolean;
}> = ({ 
  data, 
  lines, 
  className = '', 
  height = 300, 
  animate = true 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stacked Bar Chart Component
export const StackedBarChart: React.FC<{
  data: any[];
  bars: { dataKey: string; name: string; color: string }[];
  className?: string;
  height?: number;
  animate?: boolean;
}> = ({ 
  data, 
  bars, 
  className = '', 
  height = 300, 
  animate = true 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              name={bar.name}
              stackId="stack"
              fill={bar.color}
              radius={index === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Donut Chart Component (Pie with inner radius)
export const DonutChart: React.FC<ChartProps & {
  dataKey: string;
  nameKey?: string;
  centerLabel?: string;
  centerValue?: string;
}> = ({ 
  data, 
  dataKey,
  nameKey = 'name',
  className = '', 
  height = 300, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], 
  animate = true,
  centerLabel,
  centerValue
}) => {
  const total = data.reduce((sum, item) => sum + item[dataKey], 0);

  return (
    <div className={`w-full ${className} relative`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey={dataKey}
            animationDuration={animate ? 1000 : 0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && (
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {centerLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};