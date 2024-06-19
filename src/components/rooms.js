import React, { useState, useCallback, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SERVER_URL } from '../constants.js';

import Draggable from './Draggable';
import Droppable from './Droppable';
import StudentClassroomCard from './StudentClassroomCard';

function Rooms() {
    const [students, setStudents] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [initialClassrooms, setInitialClassrooms] = useState([]);
    
    const fetchStudents = () => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/studentsBasic`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.status === 204) {
            return [];
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to fetch students');
          }
        })
        .then((data) => {
          sessionStorage.setItem('students', JSON.stringify(data));
          setStudents(data);
        })
        .catch((err) => console.error(err));
    };

    const fetchGroups = useCallback(() => {
        console.log('Fetching groups...');
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/campgroups/type/CLASS`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('campgroups', JSON.stringify(data));
            const groups = data.map(group => ({
                id: group.id,
                name: group.groupName,
                leader: `${group.leader.adultName} ${group.leader.adultSurname}`,
                studentIds: group.studentIds,
                students: []
            }));
            setClassrooms(groups);
            setInitialClassrooms(groups);
            
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        console.log('Component mounted or updated');
        fetchStudents();
        fetchGroups();
    }, [fetchGroups]);
    
    useEffect(() => {
        if (students.length > 0 && classrooms.length > 0) {
            const updatedClassrooms = classrooms.map(classroom => ({
                ...classroom,
                students: classroom.studentIds.map(id => students.find(student => student.id === id))
            }));
            setClassrooms(updatedClassrooms);
            if (initialClassrooms.length === 0) {
                setInitialClassrooms(updatedClassrooms);
            }
        }
    }, [students]);

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
        } 
    
        setClassrooms(updatedClassrooms);
    }
    
    const updateRoomStudents = () => {
        const token = sessionStorage.getItem('bearer');
        const addRequests = [];
        const deleteRequests = [];

        classrooms.forEach(classroom => {
            const initialClassroom = initialClassrooms.find(ic => ic.id === classroom.id);
            const initialStudentIds = initialClassroom.students.map(s => s.id);
            const currentStudentIds = classroom.students.map(s => s.id);

            const studentsToAdd = currentStudentIds.filter(id => !initialStudentIds.includes(id));
            const studentsToRemove = initialStudentIds.filter(id => !currentStudentIds.includes(id));

            studentsToAdd.forEach(studentId => {
                addRequests.push(fetch(`${SERVER_URL}api/campgroup/${classroom.id}/student/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }));
            });

            studentsToRemove.forEach(studentId => {
                deleteRequests.push(fetch(`${SERVER_URL}api/campgroup/${classroom.id}/student/${studentId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }));
            });
        });

        Promise.all([...addRequests, ...deleteRequests])
            .then(responses => {
                console.log('All operations completed');
                setInitialClassrooms(classrooms); // Update initial classrooms after changes
            })
            .catch(err => console.error('Error with updating students:', err));
    };

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
                                <StudentClassroomCard person={student} />
                            </Draggable>
                        ))}
                    </div>
                </Droppable>

                <div className="spacer"></div>
                <div className="button-container">
                    <button onClick={updateRoomStudents}>Commit Changes to Database</button>
                </div>
                <div className="spacer"></div>
                
                {/* Rows of classrooms below the unassigned area */}
                {classrooms.map((classroom) => (
                    <Droppable key={classroom.id} id={classroom.id} className="classroom">
                        <div className="droppable-area">
                            <h4>{classroom.name}</h4>
                            <h5>Leader: {classroom.leader}</h5>
                            {classroom.students.map(student => (
                                <Draggable key={student.id} id={student.id.toString()}>
                                    <StudentClassroomCard person={student} />
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
