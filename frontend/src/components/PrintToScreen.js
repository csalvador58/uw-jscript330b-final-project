import React from 'react';
import classes from '../css/PrintToScreen.module.css';

function PrintToScreen({ message }) {
  const formattedData = JSON.stringify(message, null, 2);
  return (
    <div className={classes['code-container']}>
      <pre>{formattedData}</pre>
    </div>
  );
}

export default PrintToScreen;
