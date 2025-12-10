import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { Student } from '../../data/mockStudents';

interface ColumnProps {
    id: string;
    title: string;
    color: string;
    students: Student[];
}

export default function Column({ id, title, color, students }: ColumnProps) {
    return (
        <div className="flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col max-h-full">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                        {title}
                    </h3>
                    <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {students.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                            }`}
                    >
                        {students.map((student, index) => (
                            <Card key={student.id} student={student} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
