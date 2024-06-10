import React, { useState } from "react";
import Adults from "../AllTabs/Adults";
import Groups from "../AllTabs/Groups";
import Scheduler from "../AllTabs/Scheduler"
import LeaderAllocator from "../AllTabs/LeaderAllocator";

const PlanningTabs = () => {

    const [activeTab, setActiveTab] = useState("details");

    const handleadults = () => {
        setActiveTab("adultstab");
    };
    const handlegroups = () => {
        setActiveTab("groupstab");
    };
    const handlescheduler = () => {
        setActiveTab("schedulertab");
    };
    const handleLeaderAllocator = () => {
        setActiveTab("leaderallocatortab");
    };

    return (
        <div className="Tabs">
            {/* Tab nav */}
            <ul className="nav">
                <li
                    className={activeTab === "adultstab" ? "active" : ""}
                    onClick={handleadults}>
                Adults
                </li>
                <li
                    className={activeTab === "groupstab" ? "active" : ""}
                    onClick={handlegroups}>
                Groups
                </li>
                <li
                    className={activeTab === "schedulertab" ? "active" : ""}
                    onClick={handlescheduler}>
                Scheduler
                </li>
                <li
                    className={activeTab === "leaderallocatortab" ? "active" : ""}
                    onClick={handleLeaderAllocator}>
                Leader Allocator
                </li>
                {/* <li
                    className={activeTab === "agents" ? "active" : ""}
                    onClick={handleagents}>
                Agents
                </li> */}
            </ul>
            <div className="outlet">
                {activeTab === "adultstab" ? <Adults/> : null}
                {activeTab === "groupstab" && <Groups/>}
                {activeTab === "schedulertab" && <Scheduler/>}
                {activeTab === "leaderallocatortab" && <LeaderAllocator/>}
            </div>
        </div>
  );
};
export default PlanningTabs;
