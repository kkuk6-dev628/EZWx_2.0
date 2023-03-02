import React from 'react';
import styles from './RadioButton.module.css';
const RadioButton = ({ title, description, name = 'maximum-weight-category', id, value, selectedValue, onChange }) => {
  return (
    <label
      htmlFor={id}
      className={styles.radio__label__container}
      style={{
        backgroundColor: value === selectedValue && '#ffc241',
        color: value === selectedValue && 'black',
      }}
    >
      <span className={styles.radio__label__title}>{title}</span>
      <span className={styles.radio__label__description}>{description}</span>
      <input
        onChange={onChange}
        name={name}
        type="radio"
        id={id}
        value={value}
        checked={value === selectedValue}
        style={{ display: 'none' }}
      />
    </label>
  );
};

export { RadioButton };
