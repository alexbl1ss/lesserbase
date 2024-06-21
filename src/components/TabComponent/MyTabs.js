import React, { useState } from "react";
import StudentDetail from "../AllTabs/StudentDetail";
import StudentBookings from "../AllTabs/StudentBookings";
import StudentGroups from "../AllTabs/StudentGroups";

const MyTabs = (props) => {

    const { selectedPerson, onClose } = props;
    const [activeTab, setActiveTab] = useState("details");
    const [selectedStay, setSelectedStay] = useState(null);

    const handledetails = () => {
        setActiveTab("details");
    };
    const handlebookings = () => {
        setActiveTab("bookings");
    };
    const handleGroups = () => {
        setActiveTab("groups");
    };
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
  
    return (
        <div className="Tabs">
            {/* Tab nav */}
            <ul className="nav">
                <li
                    className={activeTab === "details" ? "active" : ""}
                    onClick={handledetails}>
                Details
                </li>
                <li
                    className={activeTab === "bookings" ? "active" : ""}
                    onClick={handlebookings}>
                Bookings
                </li>
                <li
                    className={activeTab === "groups" ? "active" : ""}
                    onClick={handleGroups}>
                    Today
                </li>
                <li
                    className="close-tab"
                    onClick={handleClose}>
                Close
                </li>
            </ul>
            <div className="outlet">
                {activeTab === "details" ? <StudentDetail selectedPerson={selectedPerson} selectedStay={selectedStay} setSelectedStay={setSelectedStay} /> : null}
                {activeTab === "bookings" ? <StudentBookings selectedPerson={selectedPerson} showFinancials={props.showFinancials} selectedStay={selectedStay} /> : null}
                {activeTab === "groups" ? <StudentGroups selectedPerson={selectedPerson}/> : null}
            </div>
        </div>
  );
};
export default MyTabs;
