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
    const [databaseState, setDatabaseState] = useState({ classrooms: [], students: [] });
    const [displayState, setDisplayState] = useState({ classrooms: [], students: [] });
    const [selectedWeek, setSelectedWeek] = useState(WEEKS[0]);
    const [selectedCampus, setSelectedCampus] = useState('');
    const [selectedEnglishLevel, setSelectedEnglishLevel] = useState('');

    const fetchStudents = useCallback((startDate, endDate) => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/rolebyweek/${startDate}/${endDate}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => response.ok ? response.json() : [])
        .then((data) => {
            setStudents(data);
            setFilteredStudents(data);
            setDatabaseState(prevState => ({
                ...prevState,
                students: data
            }));
            setDisplayState(prevState => ({
                ...prevState,
                students: data
            }));
        })
        .catch((err) => console.error(err));
    }, []);

    const filterGroupsByWeekAndCampus = useCallback((groups, startDate, endDate, campus) => {
        return groups.filter(group =>
            (!campus || group.campus === campus) &&
            group.groupDates.some(date => {
                const groupDate = new Date(date);
                return groupDate >= new Date(startDate) && groupDate <= new Date(endDate);
            })
        );
    }, []);

    const fetchGroups = useCallback((startDate, endDate, campus) => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/campgroups/type/CLASS`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => response.json())
        .then(data => {
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
            setDatabaseState(prevState => ({
                ...prevState,
                classrooms: groups
            }));
            // Initialize displayState with students populated based on studentIds
            setDisplayState(prevState => ({
                ...prevState,
                classrooms: groups.map(group => ({
                    ...group,
                    students: group.studentIds.map(studentId => prevState.students.find(student => student.studentId === studentId)).filter(student => student !== undefined)
                }))
            }));
        })
        .catch(err => console.error(err));
    }, [filterGroupsByWeekAndCampus]);

    useEffect(() => {
        fetchStudents(selectedWeek.startDate, selectedWeek.endDate);
        fetchGroups(selectedWeek.startDate, selectedWeek.endDate, selectedCampus);
    }, [fetchStudents, fetchGroups, selectedWeek, selectedCampus]);

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

    const filterStudents = useCallback(() => {
        let filtered = students;

        if (selectedCampus) {
            filtered = filtered.filter(student => student.stay_campus === selectedCampus);
        }

        if (selectedEnglishLevel) {
            filtered = filtered.filter(student => student.englishLevel === selectedEnglishLevel);
        }

        setFilteredStudents(filtered);
    }, [students, selectedCampus, selectedEnglishLevel]);

    useEffect(() => {
        filterStudents();
    }, [selectedCampus, selectedEnglishLevel, filterStudents]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const draggedId = parseInt(active.id);
        const fromClassroom = displayState.classrooms.find(room => room.students.some(s => s && s.studentId === draggedId));
        const toClassroom = over.id === "unassigned" ? null : displayState.classrooms.find(room => room.id === over.id);

        if (fromClassroom === toClassroom) {
            return;
        }

        let updatedClassrooms = [...displayState.classrooms];

        if (fromClassroom) {
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === fromClassroom.id) {
                    return { ...room, students: room.students.filter(s => s && s.studentId !== draggedId) };
                }
                return room;
            });
        }

        if (toClassroom) {
            updatedClassrooms = updatedClassrooms.map(room => {
                if (room.id === toClassroom.id) {
                    const student = students.find(s => s && s.studentId === draggedId);
                    return { ...room, students: [...room.students, student] };
                }
                return room;
            });
        }

        setDisplayState(prevState => ({
            ...prevState,
            classrooms: updatedClassrooms
        }));
    };

    const updateRoomStudents = () => {
        const token = sessionStorage.getItem('bearer');
        const addRequests = [];
        const deleteRequests = [];

        displayState.classrooms.forEach(classroom => {
            const databaseClassroom = databaseState.classrooms.find(ic => ic.id === classroom.id);
            const databaseStudentIds = databaseClassroom.studentIds;
            const currentStudentIds = classroom.students.map(s => s.studentId);

            const studentsToAdd = currentStudentIds.filter(id => !databaseStudentIds.includes(id));
            const studentsToRemove = databaseStudentIds.filter(id => !currentStudentIds.includes(id));

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
            .then(() => {
                console.log('All operations completed');
                fetchStudents(selectedWeek.startDate, selectedWeek.endDate);
                fetchGroups(selectedWeek.startDate, selectedWeek.endDate, selectedCampus);
            })
            .catch(err => console.error('Error with updating students:', err));
    };

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

                <Droppable key="unassigned" id="unassigned" className="classroom unassigned-students">
                    <div className="droppable-area">
                        <h3>Unassigned Students</h3>
                        {filteredStudents.filter(student =>
                            !displayState.classrooms.some(room => room.students.some(s => s && s.studentId === student.studentId))
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

                {displayState.classrooms.map((classroom) => (
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
