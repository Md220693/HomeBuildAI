import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  className?: string;
  iconSize?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  className,
  iconSize = 16,
  side = 'top',
  align = 'center'
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle 
            className={cn(
              "text-muted-foreground hover:text-foreground cursor-help transition-colors",
              className
            )}
            size={iconSize}
          />
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="max-w-xs p-4 space-y-2"
        >
          {title && (
            <div className="font-semibold text-sm text-foreground">{title}</div>
          )}
          <div className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface HelpSectionProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn("bg-muted/50 border rounded-lg p-4 space-y-3", className)}>
      <div className="flex items-start gap-2">
        <HelpCircle className="text-primary mt-0.5 flex-shrink-0" size={16} />
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
};