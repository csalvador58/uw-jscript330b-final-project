import React, { useState } from 'react';
import Button from '../components/Button';
import classes from '../css/Account.module.css';
import jwt from 'jsonwebtoken';

function Account({
  handleRequestDisplayUpdate,
  handleResponseDisplayUpdate,
  token,
}) {
  const [accountInfo, setAccountInfo] = useState('');
  const handleGetAccount = () => {
    const decodedToken = jwt.decode(token);
    console.log('decodedToken')
    console.log(decodedToken)

    const url = `http://localhost:3000/${decodedToken.roles[0]}`;
    const method = 'GET';
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = '';
    const apiRequest = {
      url: url,
      method: method,
      headers: headers,
      body: body,
    };
    handleRequestDisplayUpdate(apiRequest);

    fetch(url, {
      method: method,
      headers: headers,
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            console.error(data.error);
            throw new Error(
              `${response.status}: ${response.statusText}, ${data.error}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('data');
        console.log(data);
        handleResponseDisplayUpdate(data);
      })
      .catch((error) => {
        console.error(error);

        handleResponseDisplayUpdate(error.message);
      });
  };
  return (
    <div className={classes['flex-column']}>
      <p>Get Account</p>
      <Button onClick={handleGetAccount}></Button>
    </div>
  );
}

export default Account;
