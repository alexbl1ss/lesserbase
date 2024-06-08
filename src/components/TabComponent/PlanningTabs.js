import React, { useState } from "react";
import Adults from "../AllTabs/Adults";
import Groups from "../AllTabs/Groups";
import StudentBookings from "../AllTabs/StudentBookings";
import StudentPayments from "../AllTabs/StudentPayments";
import StudentInvoice from "../AllTabs/StudentInvoice";
import BookingCreator from "../AllTabs/BookingCreator";
import StudentTransfers from "../AllTabs/StudentTransfers";
import StudentSummary from "../AllTabs/StudentSummary";
import StudentStays from "../AllTabs/StudentStays"

const PlanningTabs = (props) => {

    const { selectedPerson, onClose } = props;
    const [activeTab, setActiveTab] = useState("details");
    const [selectedStay, setSelectedStay] = useState(null);

    const handleadults = () => {
        setActiveTab("adults");
    };
    const handlegroups = () => {
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
                    className={activeTab === "adults" ? "active" : ""}
                    onClick={handleadults}>
                Adults
                </li>
                <li
                    className={activeTab === "groups" ? "active" : ""}
                    onClick={handlegroups}>
                Groups
                </li>
                {/* <li
                    className={activeTab === "agents" ? "active" : ""}
                    onClick={handleagents}>
                Agents
                </li> */}
               <li
                    className="close-tab"
                    onClick={handleClose}>
                Close
                </li>
            </ul>
            <div className="outlet">
                {activeTab === "adults" ? <Adults selectedPerson={selectedPerson} selectedStay={selectedStay} setSelectedStay={setSelectedStay} /> : null}
                {activeTab === "groups" && <Groups selectedPerson={selectedPerson} selectedStay={selectedStay} setSelectedStay={setSelectedStay} />}
            </div>
        </div>
  );
};
export default PlanningTabs;
