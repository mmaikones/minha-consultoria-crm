import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MessageSquare } from 'lucide-react';
import { Chat, kanbanColumns } from '../../data/mockChats';

interface ChatKanbanProps {
    chats: Chat[];
    onChatsChange: (chats: Chat[]) => void;
    onSelectChat: (chat: Chat) => void;
}

export default function ChatKanban({ chats, onChatsChange, onSelectChat }: ChatKanbanProps) {
    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as Chat['status'];

        const updatedChats = chats.map(chat =>
            chat.id === draggableId ? { ...chat, status: newStatus } : chat
        );

        onChatsChange(updatedChats);
    };

    const getChatsByStatus = (status: string) =>
        chats.filter(chat => chat.status === status);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="h-full flex gap-4 overflow-x-auto p-4">
                {kanbanColumns.map(column => (
                    <div
                        key={column.id}
                        className="flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col"
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                                    {column.title}
                                </h3>
                                <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                    {getChatsByStatus(column.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Cards */}
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                        }`}
                                >
                                    {getChatsByStatus(column.id).map((chat, index) => (
                                        <Draggable key={chat.id} draggableId={chat.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => onSelectChat(chat)}
                                                    className={`p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                            {chat.avatar}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                                    {chat.name}
                                                                </span>
                                                                {chat.unreadCount > 0 && (
                                                                    <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] px-1 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                                                        {chat.unreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                {chat.lastMessage}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                                                <MessageSquare className="w-3 h-3" />
                                                                <span>{chat.lastMessageTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
