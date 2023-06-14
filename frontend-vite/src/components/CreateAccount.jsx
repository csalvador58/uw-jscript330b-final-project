import { useState } from 'react';
import Button from '../components/Button';
import PropTypes from 'prop-types';
import classes from '../css/CreateAccount.module.css';

const defaultFormValues = {
  name: '',
  email: '',
  password: '',
  phone: '',
  roles: [''],
  groupId: '',
};

function Update({
  handleRequestDisplayUpdate,
  handleResponseDisplayUpdate,
  auth,
}) {
  const [formValues, setFormValues] = useState(defaultFormValues);

  const inputChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormValues((currentState) => {
      const updateState = { ...currentState };
      if (name === 'roles') {
        updateState[name] = [value];
      } else if (name === 'phone' || name === 'groupId') {
        updateState[name] = parseInt(value);
      } else {
        updateState[name] = value;
      }
      return updateState;
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    // console.log('formValues');
    // console.log(formValues);

    // console.log('auth');
    // console.log(auth);
    const domain = 'https://uw-jscript330b-final-project-production.up.railway.app';
    // const domain = 'http://localhost:3000';
    const url = `${domain}/admin/createUser`;
    const method = 'POST';
    const headers = {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    };

    let body = {};
    // let body = {
    //   email: 'testVendorXEmail@email.com',
    //   password: 'vendor1230!',
    //   roles: ['vendor'],
    //   name: 'vendor account',
    //   phone: 2061112222,
    //   groupId: 2,
    // };
    for (const [key, val] of Object.entries(formValues)) {
        if (key === 'roles' && val.length === 0 ) {
            continue;
          }
          if (val !== '') {
            body[key] = val;
          }
    }

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
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            // console.error(data.error);
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
            type='phone'
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
          <label htmlFor='groupId'>groupId</label>
          <input
            type='number'
            id='groupId'
            name='groupId'
            placeholder='(1) Admin, (2) Vendor, (3) Verifier'
            value={formValues.groupId}
            onChange={inputChangeHandler}
          />
          <div>
            <Button onClick={handleUpdate}>Create Account</Button>
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
  auth: PropTypes.shape({
    token: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
};
