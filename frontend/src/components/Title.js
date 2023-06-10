import React from 'react';
import classes from '../css/Title.module.css';

function Title({ name }) {
  return (
    <div className={classes['section-style']}>
      <h1>{name}</h1>
    </div>
  );
}

export default Title;
