import React from 'react';
import styles from './RadioButton.module.css';
const RadioButton = ({ title, description, name = 'maximum-weight-category', id, value, selectedValue, onChange }) => {
  const checked = value === selectedValue;
  return (
    <label
      htmlFor={id}
      className={styles.radio__label__container}
      style={{
        backgroundColor: checked && '#ffc241',
        color: checked && 'black',
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
        checked={checked}
        style={{ display: 'none' }}
      />
    </label>
  );
};

export { RadioButton };
