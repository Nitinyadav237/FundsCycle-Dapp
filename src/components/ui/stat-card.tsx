import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// A custom type for the StatCard component to ensure consistency
type StatCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string | number;
  iconColor?: string;
};

// Stat Card using shadcn Card with dynamic icons
export default function StatCard({
  icon: Icon,
  title,
  value,
  iconColor,
}: StatCardProps) {
  return (
    <Card className="shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
      <CardContent className="flex flex-col items-center p-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4 shadow-lg">
          <Icon
            className={`w-8 h-8 ${
              iconColor ?? "text-blue-600 dark:text-blue-400"
            }`}
          />
        </div>
        <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}