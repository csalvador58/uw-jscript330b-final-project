import { useState } from 'react';
import Title from './components/Title';
// import Button from './components/Button';
import PrintToScreen from './components/PrintToScreen';
import classes from './App.module.css';
import Login from './components/Login';
import Account from './components/Account';
import CreateAccount from './components/CreateAccount';
import Update from './components/Update';

function App() {
  const [loginToken, setLoginToken] = useState({ token: 'invalid', roles: [] });
  const [displayRequest, setDisplayRequest] = useState(
    'This is a test for request'
  );
  const [displayResponse, setDisplayResponse] = useState(
    'This is a test for response'
  );

  // console.log(loginToken);
  // console.log(displayRequest);
  // console.log(displayResponse);

  const loginHandler = (auth) => {
    setLoginToken(auth);
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
   
        <h1 className={classes.header_container}>
            Vendor Credential App<span>UWJSCRIPT330 - Demo</span>
        </h1>
      </div>
      <div className={classes.flex}>
        <div className={classes.left}>
          <div className={classes['item-main1']}>         
            <Title name='Login User' />
            <Login
              handleRequestDisplayUpdate={handleRequestDisplayUpdate}
              handleResponseDisplayUpdate={handleResponseDisplayUpdate}
              loginHandler={loginHandler}
            />
          </div>
          <div className={classes['item-main2']}>
            <Title name='Account' />
            <Account
              auth={loginToken}
              handleRequestDisplayUpdate={handleRequestDisplayUpdate}
              handleResponseDisplayUpdate={handleResponseDisplayUpdate}
            />
            <CreateAccount
              auth={loginToken}
              handleRequestDisplayUpdate={handleRequestDisplayUpdate}
              handleResponseDisplayUpdate={handleResponseDisplayUpdate}
            />
            <Update
              auth={loginToken}
              handleRequestDisplayUpdate={handleRequestDisplayUpdate}
              handleResponseDisplayUpdate={handleResponseDisplayUpdate}
            />
          </div>
        </div>

        <div className={classes.right}>
          <h2 className={classes.display}>Request</h2>
          <PrintToScreen message={displayRequest} />
          <h2 className={classes.display}>Response</h2>
          <PrintToScreen message={displayResponse} />
        </div>
      </div>
    </div>
  );
}

export default App;
