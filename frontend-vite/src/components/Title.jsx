import classes from '../css/Title.module.css';
import PropTypes from 'prop-types';

function Title({ name }) {
  return (
    <div className={classes['section-style']}>
      <h1>{name}</h1>
    </div>
  );
}

export default Title;

Title.propTypes = {
  name: PropTypes.string.isRequired,
};
