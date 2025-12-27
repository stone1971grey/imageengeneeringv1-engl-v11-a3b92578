import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { useFrontendEdit } from '@/contexts/FrontendEditContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ApproveButtonProps {
  segmentKey: string;
  onApproved?: () => void;
  onRejected?: () => void;
  className?: string;
  showReject?: boolean;
}

export const ApproveButton: React.FC<ApproveButtonProps> = ({ 
  segmentKey, 
  onApproved,
  onRejected,
  className,
  showReject = true
}) => {
  const { canApprove, approveSegment, rejectSegment } = useFrontendEdit();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!canApprove) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const success = await approveSegment(segmentKey);
      if (success) {
        toast.success('Segment freigegeben', {
          description: 'Die Änderungen sind jetzt live.'
        });
        onApproved?.();
      } else {
        toast.error('Freigabe fehlgeschlagen');
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const success = await rejectSegment(segmentKey);
      if (success) {
        toast.info('Änderungen verworfen', {
          description: 'Der Entwurf wurde verworfen.'
        });
        onRejected?.();
      } else {
        toast.error('Verwerfen fehlgeschlagen');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        className="gap-1 bg-green-600 hover:bg-green-500 text-white"
      >
        {isApproving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Freigeben
      </Button>
      
      {showReject && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isApproving || isRejecting}
          className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          {isRejecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Verwerfen
        </Button>
      )}
    </div>
  );
};
