import { useState } from 'react';
import Button from '../components/Button';
import PropTypes from 'prop-types';
import classes from '../css/Update.module.css';

const defaultFormValues = {
  name: '',
  email: '',
  password: '',
  phone: 0,
  roles: [''],
};

function Update({
  handleRequestDisplayUpdate,
  handleResponseDisplayUpdate,
  token,
}) {
  const [formValues, setFormValues] = useState(defaultFormValues);

  const inputChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormValues((currentState) => {
      const updateState = { ...currentState };
      if (name === 'roles') {
        updateState[name] = [value];
      } else if (name === 'phone') {
        updateState[name] = parseInt(value);
      } else {
        updateState[name] = value;
      }
      return updateState;
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    console.log('formValues');
    console.log(formValues);

    console.log('token');
    console.log(token);

    const url = `http://localhost:3000/${token.roles[0]}`;
    const method = 'PUT';
    const headers = {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json',
    };

    const fieldsToUpdate = {};
    for (const [key, val] of Object.entries(formValues)) {
      if (key === 'phone' && val === 0) {
        continue;
      }
      if (val !== '') {
        fieldsToUpdate[key] = val;
      }
    }

    const body = fieldsToUpdate;
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
      <form>
        <div className={classes['flex-column']}>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            id='name'
            name='name'
            placeholder='First and Last Name'
            value={formValues.name}
            onChange={inputChangeHandler}
          />
          <label htmlFor='email'>Email</label>
          <input
            type='text'
            id='email'
            name='email'
            placeholder='i.e. myemail@email.com'
            value={formValues.email}
            onChange={inputChangeHandler}
          />
          <label htmlFor='password'>Password</label>
          <input
            type='text'
            id='password'
            name='password'
            placeholder='Must be 6 chars with 1 num and 1 special'
            value={formValues.password}
            onChange={inputChangeHandler}
          />
          <label htmlFor='phone'>Phone</label>
          <input
            type='number'
            id='phone'
            name='phone'
            placeholder='Numbers only, no spaces or dashes'
            value={formValues.phone}
            onChange={inputChangeHandler}
          />
          <label htmlFor='roles'>Roles</label>
          <input
            type='text'
            id='roles'
            name='roles'
            placeholder='Account role'
            value={formValues.roles[0]}
            onChange={inputChangeHandler}
          />
          <div>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Update;

Update.propTypes = {
  handleRequestDisplayUpdate: PropTypes.func.isRequired,
  handleResponseDisplayUpdate: PropTypes.func.isRequired,
  token: PropTypes.shape({
    token: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }),
};
