import React, { useState } from "react";
import Adults from "../AllTabs/Adults";
import Groups from "../AllTabs/Groups";
import Scheduler from "../AllTabs/Scheduler"

const PlanningTabs = () => {

    const [activeTab, setActiveTab] = useState("details");
    const [selectedStay, setSelectedStay] = useState(null);

    const handleadults = () => {
        setActiveTab("adults");
    };
    const handlegroups = () => {
        setActiveTab("groups");
    };
    const handlescheduler = () => {
        setActiveTab("scheduler");
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
                </li><li
                    className={activeTab === "scheduler" ? "active" : ""}
                    onClick={handlescheduler}>
                Scheduler
                </li>
                {/* <li
                    className={activeTab === "agents" ? "active" : ""}
                    onClick={handleagents}>
                Agents
                </li> */}
            </ul>
            <div className="outlet">
                {activeTab === "adults" ? <Adults/> : null}
                {activeTab === "groups" && <Groups/>}
                {activeTab === "scheduler" && <Scheduler/>}
            </div>
        </div>
  );
};
export default PlanningTabs;
