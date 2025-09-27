import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import clsx from 'clsx';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { WorkItem } from '../../types/api';

const columnOrder: Array<WorkItem['status']> = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const columnLabels: Record<WorkItem['status'], { title: string; badge: keyof typeof badgeVariants }> = {
  TODO: { title: 'To Do', badge: 'info' },
  IN_PROGRESS: { title: 'In Progress', badge: 'warning' },
  REVIEW: { title: 'Review', badge: 'info' },
  DONE: { title: 'Done', badge: 'success' },
};

const badgeVariants = {
  info: 'info',
  warning: 'warning',
  success: 'success',
} as const;

const priorityColors: Record<WorkItem['priority'], keyof typeof badgeVariants> = {
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'success',
};

interface KanbanBoardProps {
  items: WorkItem[];
  onStatusChange: (id: string, status: WorkItem['status']) => void;
  onSelectItem?: (id: string) => void;
  selectedItemId?: string;
}

export const KanbanBoard = ({ items, onStatusChange, onSelectItem, selectedItemId }: KanbanBoardProps) => {
  const columns = columnOrder.map((status) => ({
    status,
    title: columnLabels[status].title,
    items: items.filter((item) => item.status === status),
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as WorkItem['status'];
    if (result.source.droppableId === newStatus) return;
    const workItem = columns
      .find((column) => column.status === (result.source.droppableId as WorkItem['status']))?.items[result.source.index];
    if (workItem) {
      onStatusChange(workItem.id, newStatus);
    }
  };

  return (
    <Card title="Kanban Board" subtitle="Drag work items across the workflow">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {columns.map(({ status, title, items: columnItems }) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex min-h-[320px] flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <Badge variant={badgeVariants[columnLabels[status].badge]}>{columnItems.length}</Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    {columnItems.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={clsx(
                              'rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white shadow-card transition',
                              selectedItemId === item.id && 'border-blue-400 bg-blue-500/10',
                            )}
                            onClick={() => onSelectItem?.(item.id)}
                            style={{
                              ...dragProvided.draggableProps.style,
                              boxShadow: dragSnapshot.isDragging ? '0 20px 45px -20px rgba(59, 130, 246, 0.55)' : undefined,
                            }}
                          >
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-blue-200">
                              <span>{item.id.slice(0, 6)}</span>
                              <Badge variant={badgeVariants[priorityColors[item.priority]]}>{item.priority}</Badge>
                            </div>
                            <h4 className="mt-2 text-base font-semibold">{item.title}</h4>
                            {item.description && <p className="mt-2 line-clamp-3 text-xs text-slate-200">{item.description}</p>}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                              <span>Reporter: {item.reporter?.profile?.firstName ?? '—'}</span>
                              <span>•</span>
                              <span>Assignee: {item.assignee?.profile?.firstName ?? 'Unassigned'}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {columnItems.length === 0 && !snapshot.isDraggingOver && (
                      <p className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-xs text-slate-300">
                        No items in this column
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </Card>
  );
};
