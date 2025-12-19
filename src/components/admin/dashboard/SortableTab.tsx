import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";

interface SortableTabProps {
  id: string;
  value: string;
  children: React.ReactNode;
  isDraggable?: boolean;
}

export const SortableTab = ({ id, value, children, isDraggable = true }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggable ? 'grab' : 'default',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <TabsTrigger 
        value={value}
        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black flex-1"
      >
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4 text-gray-500" />
            </div>
          )}
          {children}
        </div>
      </TabsTrigger>
    </div>
  );
};
