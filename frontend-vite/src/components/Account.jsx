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
    const url = `http://localhost:3000/${auth.roles[0]}`;
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
        console.log('data');
        console.log(data);
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
      <p>Get Account</p>
      <Button onClick={handleGetAccount}>View Account</Button>
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
