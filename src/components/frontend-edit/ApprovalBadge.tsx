import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Edit3, Layers, Upload, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalBadgeProps {
  status: 'draft' | 'pending' | 'approved';
  importStage?: number;
  className?: string;
  showStage?: boolean;
  variant?: 'default' | 'compact' | 'inline';
}

export const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ 
  status, 
  importStage = 1,
  className,
  showStage = true,
  variant = 'default'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Entwurf',
          shortLabel: 'Entwurf',
          icon: Edit3,
          bgClass: 'bg-yellow-500',
          textClass: 'text-yellow-950',
          borderClass: 'border-yellow-400'
        };
      case 'pending':
        return {
          label: 'Wartet auf Freigabe',
          shortLabel: 'Pending',
          icon: Clock,
          bgClass: 'bg-orange-500',
          textClass: 'text-orange-950',
          borderClass: 'border-orange-400'
        };
      case 'approved':
        return {
          label: 'Freigegeben',
          shortLabel: 'Live',
          icon: Check,
          bgClass: 'bg-green-500',
          textClass: 'text-green-950',
          borderClass: 'border-green-400'
        };
      default:
        return {
          label: status,
          shortLabel: status,
          icon: Check,
          bgClass: 'bg-gray-500',
          textClass: 'text-gray-950',
          borderClass: 'border-gray-400'
        };
    }
  };

  const getStageConfig = () => {
    if (importStage === 1) {
      return {
        label: 'Erst-Import',
        shortLabel: 'S1',
        icon: Upload,
        bgClass: 'bg-purple-500',
        textClass: 'text-purple-950'
      };
    } else {
      return {
        label: 'Refine Import',
        shortLabel: `S${importStage}`,
        icon: RefreshCw,
        bgClass: 'bg-blue-500',
        textClass: 'text-blue-950'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const stageConfig = getStageConfig();
  const StatusIcon = statusConfig.icon;
  const StageIcon = stageConfig.icon;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
          statusConfig.bgClass,
          statusConfig.textClass
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.shortLabel}
        </span>
        {showStage && importStage > 1 && (
          <span className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
            stageConfig.bgClass,
            stageConfig.textClass
          )}>
            <StageIcon className="h-3 w-3" />
            {stageConfig.shortLabel}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        statusConfig.bgClass,
        statusConfig.textClass,
        className
      )}>
        <StatusIcon className="h-3 w-3" />
        {statusConfig.shortLabel}
        {showStage && importStage > 1 && (
          <>
            <span className="mx-0.5">•</span>
            <StageIcon className="h-3 w-3" />
            S{importStage}
          </>
        )}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        className={cn(
          "gap-1.5 text-xs font-semibold border-0 shadow-sm",
          statusConfig.bgClass,
          statusConfig.textClass
        )}
      >
        <StatusIcon className="h-3.5 w-3.5" />
        {statusConfig.label}
      </Badge>
      
      {showStage && (
        <Badge 
          className={cn(
            "gap-1.5 text-xs font-semibold border-0 shadow-sm",
            stageConfig.bgClass,
            stageConfig.textClass
          )}
        >
          <StageIcon className="h-3.5 w-3.5" />
          {stageConfig.label}
        </Badge>
      )}
    </div>
  );
};