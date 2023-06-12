import { useState } from 'react';
import Title from './components/Title';
// import Button from './components/Button';
import PrintToScreen from './components/PrintToScreen';
import classes from './App.module.css';
import Login from './components/Login';
import Account from './components/Account';

function App() {
  const [loginToken, setLoginToken] = useState({ token: '', roles: [] });
  const [displayRequest, setDisplayRequest] = useState(
    'This is a test for request'
  );
  const [displayResponse, setDisplayResponse] = useState(
    'This is a test for response'
  );

  console.log(loginToken);
  console.log(displayRequest);
  console.log(displayResponse);

  const loginHandler = (token) => {
    setLoginToken(token);
  };
  const handleRequestDisplayUpdate = (state) => {
    setDisplayRequest(state);
  };
  const handleResponseDisplayUpdate = (state) => {
    setDisplayResponse(state);
  };

  return (
    <div className={classes.container}>
      <div className={classes['item-header']}>
        <div className={classes['section-header']}>
          <h1>
            Vendor Credential App<span>UWJSCRIPT330 - Final Project</span>
          </h1>
        </div>
      </div>
      <div className={classes['item-main1']}>
        <div className={classes['flex-column']}>
          <Title name='Login User' />
          <div>
            <div className={classes['flex.column']}>
              <Login
                handleRequestDisplayUpdate={handleRequestDisplayUpdate}
                handleResponseDisplayUpdate={handleResponseDisplayUpdate}
                loginHandler={loginHandler}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={classes['item-main2']}>
        <Title name='Account' />
        <Account
          token={loginToken}
          handleRequestDisplayUpdate={handleRequestDisplayUpdate}
          handleResponseDisplayUpdate={handleResponseDisplayUpdate}
        />
      </div>
      <div className={classes['item-main3']}>
        <Title name='Other' />
      </div>
      <div className={classes['item-side1']}>
        <h2 className={classes.center}>Request</h2>
        <div>
          <PrintToScreen message={displayRequest} />
        </div>
      </div>
      <div className={classes['item-side2']}>
        <h2 className={classes.center}>Response</h2>
        <div>
          <PrintToScreen message={displayResponse} />
        </div>
      </div>
      <div className={classes['item-footer']}>footer</div>
    </div>
  );
}

export default App;