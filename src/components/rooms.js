import React, { useState, useCallback, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SERVER_URL } from '../constants.js';
import { WEEKS } from '../constants.js';

import Draggable from './Draggable';
import Droppable from './Droppable';
import StudentClassroomCard from './StudentClassroomCard';

function Rooms() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [initialClassrooms, setInitialClassrooms] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(WEEKS[0]); // Default to the first week
    const [selectedCampus, setSelectedCampus] = useState(''); // State for selected campus
    const [selectedEnglishLevel, setSelectedEnglishLevel] = useState(''); // State for selected English level

    const fetchStudents = (startDate, endDate) => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/rolebyweek/${startDate}/${endDate}`, {
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
            setFilteredStudents(data);
        })
        .catch((err) => console.error(err));
    };

    const filterGroupsByWeekAndCampus = (groups, startDate, endDate, campus) => {
        return groups.filter(group => 
            (!campus || group.campus === campus) &&
            group.groupDates.some(date => {
                const groupDate = new Date(date);
                return groupDate >= new Date(startDate) && groupDate <= new Date(endDate);
            })
        );
    };

    const fetchGroups = useCallback((startDate, endDate, campus) => {
        console.log('Fetching groups...');
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/campgroups/type/CLASS`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('campgroups', JSON.stringify(data));
            const filteredGroups = filterGroupsByWeekAndCampus(data, startDate, endDate, campus);
            const groups = filteredGroups.map(group => ({
                id: group.id,
                name: group.groupName,
                leader: `${group.leader.adultName} ${group.leader.adultSurname}`,
                studentIds: group.studentIds,
                students: [],
                campus: group.campus,
                groupDates: group.groupDates
            }));
            setClassrooms(groups);
            setInitialClassrooms(groups);
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        console.log('Component mounted or updated');
        fetchStudents(selectedWeek.startDate, selectedWeek.endDate);
        fetchGroups(selectedWeek.startDate, selectedWeek.endDate, selectedCampus);
    }, [fetchGroups, selectedWeek, selectedCampus]);

    useEffect(() => {
        if (students.length > 0) {
            const updatedClassrooms = initialClassrooms.map(classroom => ({
                ...classroom,
                students: classroom.studentIds.map(studentId => students.find(student => student && student.studentId === studentId)).filter(student => student !== undefined)
            }));
            setClassrooms(updatedClassrooms);
            setInitialClassrooms(updatedClassrooms);
        }
    }, [students]);

    useEffect(() => {
        filterStudents();
    }, [selectedCampus, selectedEnglishLevel]);

    const handleWeekChange = (event) => {
        const selectedWeek = WEEKS.find(week => week.week === event.target.value);
        setSelectedWeek(selectedWeek);
    };

    const handleCampusChange = (event) => {
        setSelectedCampus(event.target.value);
    };

    const handleEnglishLevelChange = (event) => {
        setSelectedEnglishLevel(event.target.value);
    };

    const filterStudents = () => {
        let filtered = students;

        if (selectedCampus) {
            filtered = filtered.filter(student => student.stay_campus === selectedCampus);
        }

        if (selectedEnglishLevel) {
            filtered = filtered.filter(student => student.englishLevel === selectedEnglishLevel);
        }

        setFilteredStudents(filtered);
    };

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;

        const draggedId = parseInt(active.id);
        const fromClassroom = classrooms.find(room => room.students.some(s => s && s.studentId === draggedId));
        const toClassroom = over.id === "unassigned" ? null : classrooms.find(room => room.id === over.id);

        if (fromClassroom === toClassroom) {
            return; // No move needed if it's the same room
        }

        let updatedClassrooms = [...classrooms];
        if (fromClassroom) {
            // Remove student from current classroom
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === fromClassroom.id) {
                    return { ...room, students: room.students.filter(s => s && s.studentId !== draggedId) };
                }
                return room;
            });
        }

        if (toClassroom) {
            // Add student to new classroom
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === toClassroom.id) {
                    const student = students.find(s => s && s.studentId === draggedId);
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
            const initialStudentIds = initialClassroom.students.map(s => s.studentId);
            const currentStudentIds = classroom.students.map(s => s.studentId);

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

    // Get unique campuses and English levels for the dropdown options
    const campuses = Array.from(new Set(students.map(student => student.stay_campus)));
    const englishLevels = Array.from(new Set(students.map(student => student.englishLevel)));

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="classrooms-container">
                <div className="filter-container">
                    <div className="filter">
                        <label htmlFor="week-select">Select Week: </label>
                        <select id="week-select" value={selectedWeek.week} onChange={handleWeekChange}>
                            {WEEKS.map(week => (
                                <option key={week.week} value={week.week}>
                                    {week.week}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter">
                        <label htmlFor="campus-select">Select Campus: </label>
                        <select id="campus-select" value={selectedCampus} onChange={handleCampusChange}>
                            <option value="">All Campuses</option>
                            {campuses.map(campus => (
                                <option key={campus} value={campus}>
                                    {campus}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter">
                        <label htmlFor="english-level-select">Select English Level: </label>
                        <select id="english-level-select" value={selectedEnglishLevel} onChange={handleEnglishLevelChange}>
                            <option value="">All Levels</option>
                            {englishLevels.map(level => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Separate area for unassigned students, make sure it's styled distinctly */}
                <Droppable key="unassigned" id="unassigned" className="classroom unassigned-students">
                    <div className="droppable-area">
                        <h3>Unassigned Students</h3>
                        {filteredStudents.filter(student => 
                            !classrooms.some(room => room.students.some(s => s && s.studentId === student.studentId))
                        ).map(student => (
                            <Draggable key={student.studentId} id={student.studentId.toString()}>
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
                                <Draggable key={student.studentId} id={student.studentId.toString()}>
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
