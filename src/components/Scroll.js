import React from 'react';

const Scroll = (props) => {
  return( 
    <div style={{overflowY: 'scroll', height:'35vh'}}>
      {props.children}
    </div>	
  );
}

export default Scroll;
