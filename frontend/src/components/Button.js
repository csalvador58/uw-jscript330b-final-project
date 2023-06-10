import React from 'react';
import classes from '../css/Button.module.css';

function Button({ onClick, children }) {
  return (
    <button className={classes['button-15']} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
