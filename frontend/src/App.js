import React from 'react';
import Title from '../src/components.js/Title';
import classes from './App.module.css';

function App() {
  return (
    <div className={classes.container}>
      <div className={classes['item-header']}>
        <div className={classes['item-header section-header']}>
          <h1>
            Vendor Credential App<span>Zero Knowledge</span>
          </h1>
        </div>
      </div>
      <div className={classes['item-main1']}>
        <Title name='Admin' />
      </div>
      <div className={classes['item-main2']}>
        <Title name='Vendor' />
      </div>
      <div className={classes['item-main3']}>
        <Title name='Verifier' />
      </div>
      <div className={classes['item-side1']}>side1</div>
      <div className={classes['item-side2']}>side2</div>
      <div className={classes['item-footer']}>footer</div>
    </div>
  );
}

export default App;
