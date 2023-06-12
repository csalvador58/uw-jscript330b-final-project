import classes from '../css/PrintToScreen.module.css';
import PropTypes from 'prop-types';

function PrintToScreen({ message }) {
  const formattedData = JSON.stringify(message, null, 2).replace(/\\/g, '');
  return (
    <div className={classes['code-container']}>
      <pre>{formattedData}</pre>
    </div>
  );
}

export default PrintToScreen;

PrintToScreen.propTypes = {
  message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};
