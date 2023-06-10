import React, { useState } from 'react';
import Button from '../components/Button';
import classes from '../css/Login.module.css';

const defaultFormValues = {
  email: '',
  password: '',
};

function Login({
  handleRequestDisplayUpdate,
  handleResponseDisplayUpdate,
  isUserLoggedIn,
  loginHandler,
}) {
  const [formValues, setFormValues] = useState(defaultFormValues);

  const inputChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormValues((currentState) => {
      const updateState = { ...currentState };
      updateState[name] = value;
      return updateState;
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const url = 'http://localhost:3000/login';
    const method = 'POST';
    const headers = {
      // Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify(formValues);
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
          //   return response.json().then((data) => {
          //     throw new Error(data.error);
          //     // throw new Error(`
          //     //     ${response.status}: ${response.statusText},
          //     //     Error: ${data}
          //     //     `);
          //   });
          return response.text().then((data) => {
            console.error(data); // Log the response data for inspection
            throw new Error(
              `${response.status}: ${response.statusText}, ${data}`
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
    setFormValues(defaultFormValues);
  };
  return (
    <>
      <form action='/action_page.php'>
        <label htmlFor='email'>Email</label>
        <input
          type='text'
          id='email'
          name='email'
          placeholder='Your email..'
          value={formValues.email}
          onChange={inputChangeHandler}
        />

        <label htmlFor='password'>Password</label>
        <input
          type='text'
          id='password'
          name='password'
          placeholder='Password..'
          value={formValues.password}
          onChange={inputChangeHandler}
        />
      </form>
      <div>
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </>
  );
}

export default Login;
