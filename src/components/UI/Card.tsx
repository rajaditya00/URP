import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-bg-primary border border-border-color rounded-lg p-6 transition-shadow hover:shadow-sm ${className}`}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-text-secondary font-medium mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-text-primary leading-none tracking-tight">{value}</h2>
        </div>
        <div className="w-11 h-11 rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-sm w-fit ${trendUp
            ? 'text-status-success bg-status-success/10'
            : 'text-status-danger bg-status-danger/10'
          }`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </Card>
  );
};
