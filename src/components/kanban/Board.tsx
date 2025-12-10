import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import { Student, StudentStatus, studentColumns } from '../../data/mockStudents';

interface BoardProps {
    students: Student[];
    onStudentsChange: (students: Student[]) => void;
}

export default function Board({ students, onStudentsChange }: BoardProps) {
    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as StudentStatus;

        const updatedStudents = students.map(student =>
            student.id === draggableId
                ? { ...student, status: newStatus }
                : student
        );

        onStudentsChange(updatedStudents);
    };

    const getStudentsByStatus = (status: string) =>
        students.filter(student => student.status === status);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="h-full flex gap-4 overflow-x-auto pb-4">
                {studentColumns.map(column => (
                    <Column
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        students={getStudentsByStatus(column.id)}
                    />
                ))}
            </div>
        </DragDropContext>
    );
}
