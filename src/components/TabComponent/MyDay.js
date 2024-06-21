import React, { useState, useCallback, useEffect } from "react";
import { SERVER_URL } from "../../constants";

const MyDay = (props) => {
    
    const { selectedPerson } = props;
    const [student, setStudent] = useState(null);

    console.log("in myday");
    
    const fetchStudent = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/students/${selectedPerson.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            if (response.status === 204) {
              return null;
            } else if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch student');
            }
          })
          .then((data) => {
            setStudent(data);
          })
          .catch((err) => console.error(err));
    }, [selectedPerson]);

    useEffect(() => {
        fetchStudent();
      }, [fetchStudent]);
    
    return (
        <div>
            this is my day: {selectedPerson.studentName}
            student: {student.studentName}
        </div>
    );
}

export default MyDay