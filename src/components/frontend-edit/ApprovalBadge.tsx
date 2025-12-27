import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Edit3, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalBadgeProps {
  status: 'draft' | 'pending' | 'approved';
  importStage?: number;
  className?: string;
  showStage?: boolean;
}

export const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ 
  status, 
  importStage = 1,
  className,
  showStage = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Entwurf',
          icon: Edit3,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
        };
      case 'pending':
        return {
          label: 'Wartet auf Freigabe',
          icon: Clock,
          className: 'bg-orange-500/20 text-orange-400 border-orange-500/50'
        };
      case 'approved':
        return {
          label: 'Live',
          icon: Check,
          className: 'bg-green-500/20 text-green-400 border-green-500/50'
        };
      default:
        return {
          label: status,
          icon: Check,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn("gap-1 text-xs font-medium", config.className)}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      
      {showStage && importStage > 1 && (
        <Badge 
          variant="outline" 
          className="gap-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/50"
        >
          <Layers className="h-3 w-3" />
          Stage {importStage}
        </Badge>
      )}
    </div>
  );
};
