import classes from '../css/Button.module.css';
import PropTypes from 'prop-types';

function Button({ onClick, children }) {
  return (
    <button className={classes['button-15']} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
};
