import React, { useState } from "react";
import StudentDetail from "../AllTabs/StudentDetail";
import StudentAgents from "../AllTabs/StudentAgents";
import StudentBookings from "../AllTabs/StudentBookings";
import StudentPayments from "../AllTabs/StudentPayments";
import StudentInvoice from "../AllTabs/StudentInvoice";
import BookingCreator from "../AllTabs/BookingCreator";
import StudentTransfers from "../AllTabs/StudentTransfers";
import StudentStays from "../AllTabs/StudentStays"

const MyTabs = (props) => {

    const { selectedPerson, onClose } = props;
    const [activeTab, setActiveTab] = useState("details");
    //  Functions to handle Tab Switching

    const handledetails = () => {
        setActiveTab("details");
    };
    const handleagents = () => {
        setActiveTab("agents");
    };
    const handlestays = () => {
        setActiveTab("stays");
    };
    const handletransfers = () => {
        setActiveTab("transfers");
    };
    const handlebookings = () => {
        setActiveTab("bookings");
    };
    const handlebookingcreator = () => {
        setActiveTab("bookingcreator");
    };
    const handlepayments = () => {
        setActiveTab("payments");
    };
    const handleinvoice = () => {
        setActiveTab("invoice");
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
                    className={activeTab === "stays" ? "active" : ""}
                    onClick={handlestays}>
                Stays
                </li>
                {/* <li
                    className={activeTab === "agents" ? "active" : ""}
                    onClick={handleagents}>
                Agents
                </li> */}
                {/* <li
                    className={activeTab === "transfers" ? "active" : ""}
                    onClick={handletransfers}>
                Transfers
                </li> */}
                <li
                    className={activeTab === "bookingcreator" ? "active" : ""}
                    onClick={handlebookingcreator}>
                Booker
                </li>
                <li
                    className={activeTab === "bookings" ? "active" : ""}
                    onClick={handlebookings}>
                Bookings
                </li>
                {/* <li
                    className={activeTab === "payments" ? "active" : ""}
                    onClick={handlepayments}>
                Payments
                </li> */}
                {/* <li
                    className={activeTab === "invoice" ? "active" : ""}
                    onClick={handleinvoice}>
                Invoice/Receipt
                </li> */}
                <li
                    className="close-tab"
                    onClick={handleClose}>
                Close
                </li>
            </ul>
            <div className="outlet">
                {activeTab === "details" ? <StudentDetail selectedPerson={selectedPerson}/> : null}
                {activeTab === "stays" ? <StudentStays selectedPerson={selectedPerson}/> : null}
                {activeTab === "agents" ? <StudentAgents selectedPerson={selectedPerson}/> : null}
                {activeTab === "transfers" ? <StudentTransfers selectedPerson={selectedPerson}/> : null}
                {activeTab === "bookings" ? <StudentBookings selectedPerson={selectedPerson}/> : null}
                {activeTab === "bookingcreator" ? <BookingCreator selectedPerson={selectedPerson}/> : null}
                {activeTab === "payments" ? <StudentPayments selectedPerson={selectedPerson}/> : null}
                {activeTab === "invoice" ? <StudentInvoice selectedPerson={selectedPerson}/> : null}
            </div>
        </div>
  );
};
export default MyTabs;
