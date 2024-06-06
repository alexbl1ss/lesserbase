import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';

import Draggable from './Draggable';
import Droppable from './Droppable';
import Card from './Card';

function Rooms() {
    const [students, setStudents] = useState([
        { id: 1, name: "Alice", studentGender: "female", studentName: "Alice", studentSurname: "Johnson", mtRef: "MT001", studentNationality: "American" },
        { id: 2, name: "Bob", studentGender: "male", studentName: "Bob", studentSurname: "Smith", mtRef: "MT002", studentNationality: "British" },
        { id: 3, name: "Charlie", studentGender: "male", studentName: "Charlie", studentSurname: "Brown", mtRef: "MT003", studentNationality: "Canadian" }
    ]);
    

    const [classrooms, setClassrooms] = useState([
        { id: 'A', name: "Room A", students: [] },
        { id: 'B', name: "Room B", students: [] },
        { id: 'C', name: "Room C", students: [] },
        { id: 'D', name: "Room D", students: [] },
        { id: 'E', name: "Room E", students: [] },
        { id: 'F', name: "Room F", students: [] }
    ]);

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;
    
        const draggedId = parseInt(active.id);
        const fromClassroom = classrooms.find(room => room.students.some(s => s.id === draggedId));
        const toClassroom = over.id === "unassigned" ? null : classrooms.find(room => room.id === over.id);
    
        if (fromClassroom === toClassroom) {
            return; // No move needed if it's the same room
        }
    
        let updatedClassrooms = [...classrooms];
        if (fromClassroom) {
            // Remove student from current classroom
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === fromClassroom.id) {
                    return { ...room, students: room.students.filter(s => s.id !== draggedId) };
                }
                return room;
            });
        }
    
        if (toClassroom) {
            // Add student to new classroom
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === toClassroom.id) {
                    const student = students.find(s => s.id === draggedId);
                    return { ...room, students: [...room.students, student] };
                }
                return room;
            });
        } else {
            // If moving to unassigned, we should effectively just update the classrooms list as above
            // because the unassigned list is derived from those not in any classrooms.
        }
    
        setClassrooms(updatedClassrooms);
    }
    
    

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="classrooms-container">
                
                {/* Separate area for unassigned students, make sure it's styled distinctly */}
                <Droppable key="unassigned" id="unassigned" className="classroom unassigned-students">
                    <div className="droppable-area">
                        <h3>Unassigned Students</h3>
                        {students.filter(student => 
                            !classrooms.some(room => room.students.some(s => s.id === student.id))
                        ).map(student => (
                            <Draggable key={student.id} id={student.id.toString()}>
                                <Card person={student} />
                            </Draggable>
                        ))}
                    </div>
                </Droppable>

                <div className="spacer"></div>
                
                {/* Rows of classrooms below the unassigned area */}
                {classrooms.map((classroom) => (
                    <Droppable key={classroom.id} id={classroom.id} className="classroom">
                        <div className="droppable-area">
                            <h4>{classroom.name}</h4>
                            {classroom.students.map(student => (
                                <Draggable key={student.id} id={student.id.toString()}>
                                    <Card person={student} />
                                </Draggable>
                            ))}
                            {classroom.students.length === 0 && <p>No students assigned</p>}
                        </div>
                    </Droppable>
                ))}
            </div>
        </DndContext>
    );
    
    
    
}

export default Rooms;
