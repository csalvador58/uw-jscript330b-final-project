import { useState } from 'react';
import Button from '../components/Button';
import classes from '../css/Account.module.css';
import PropTypes from 'prop-types';

function Account({
  handleRequestDisplayUpdate,
  handleResponseDisplayUpdate,
  auth,
}) {
  const [accountInfo, setAccountInfo] = useState('');
  const handleGetAccount = () => {
    const domain = 'https://uw-jscript330b-final-project-production.up.railway.app';
    // const domain = 'http://localhost:3000';
    const url = `${domain}/${auth.roles[0]}`;
    const method = 'GET';
    const headers = {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    };

    const apiRequest = {
      url: url,
      method: method,
      headers: headers,
    };

    handleRequestDisplayUpdate(apiRequest);

    fetch(url, {
      method: method,
      headers: headers,
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
        setAccountInfo(data);
        console.log('accountInfo');
        console.log(accountInfo);
      })
      .catch((error) => {
        console.error(error);

        handleResponseDisplayUpdate(error.message);
      });
  };

  return (
    <div className={classes['flex-column']}>
      <p>Token</p>
      <p className={classes.token}>{auth.token}</p>
      <p>Roles: <span className={classes.blue}>{auth.roles[0]}</span></p>
      <Button onClick={handleGetAccount}>Click to View Account</Button>
    </div>
  );
}

export default Account;

Account.propTypes = {
  handleRequestDisplayUpdate: PropTypes.func.isRequired,
  handleResponseDisplayUpdate: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    token: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
};
