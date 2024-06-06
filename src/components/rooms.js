import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';

import Draggable from './Draggable';
import Droppable from './Droppable';

function Rooms() {
    const [students, setStudents] = useState([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" }
    ]);

    const [classrooms, setClassrooms] = useState([
        { id: 'A', name: "Room A", students: [] },
        { id: 'B', name: "Room B", students: [] },
        { id: 'C', name: "Room C", students: [] }
    ]);

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;

        const { id: draggedId } = active;
        const fromClassroom = classrooms.find(room => room.students.some(s => s.id === parseInt(draggedId)));
        const toClassroom = classrooms.find(room => room.id === over.id);

        if (fromClassroom === toClassroom) {
            return; // No move needed if it's the same room
        }

        const student = fromClassroom ? fromClassroom.students.find(s => s.id === parseInt(draggedId)) : students.find(s => s.id === parseInt(draggedId));

        // Update the rooms
        const updatedClassrooms = classrooms.map(room => {
            if (fromClassroom && room.id === fromClassroom.id) {
                // Remove from current classroom
                return { ...room, students: room.students.filter(s => s.id !== parseInt(draggedId)) };
            } else if (room.id === over.id) {
                // Add to new classroom
                return { ...room, students: [...room.students, student] };
            }
            return room;
        });

        setClassrooms(updatedClassrooms);

        // If moving from unassigned, update the main students list
        if (!fromClassroom) {
            setStudents(students.filter(s => s.id !== parseInt(draggedId)));
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="unassigned-students">
                <h3>Unassigned Students</h3>
                {students.map(student => (
                    <Draggable key={student.id} id={student.id.toString()}>
                        {student.name}
                    </Draggable>
                ))}
            </div>
            {classrooms.map((classroom) => (
                <Droppable key={classroom.id} id={classroom.id} className="classroom">
                    <div className={ "droppable-area" }>
                    <h4>{classroom.name}</h4>
                    {classroom.students.map(student => (
                        <Draggable key={student.id} id={student.id.toString()}>
                            {student.name}
                        </Draggable>
                    ))}
                    {classroom.students.length === 0}
                    </div>
                </Droppable>
            ))}
        </DndContext>
    );
}

export default Rooms;
