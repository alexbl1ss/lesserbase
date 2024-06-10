import React from 'react';
import PlanningTabs from './TabComponent/PlanningTabs.js';



function Planner() {
  
  const showTabs = () => {
    
    return <PlanningTabs/>;
    
  };
   
  return (
    <section className="garamond">
      <div className="pa2"></div>
        {showTabs()}
      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>
          Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
        </p>
      </div>
    </section>
  );
}

export default Planner;
