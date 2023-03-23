import React from 'react';
import styles from './RadioButton.module.css';
const RadioButton = ({
  title,
  description,
  name = 'maximum-weight-category',
  id,
  value,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`${styles.radio__label__container} ${disabled ? 'disabled' : ''}`}
      style={{
        backgroundColor: value === selectedValue && '#ffc241',
        color: disabled ? '#999' : value === selectedValue ? 'black' : 'white',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <span className={styles.radio__label__title}>{title}</span>
      {description && <span className={styles.radio__label__description}>{description}</span>}
      <input
        onChange={onChange}
        name={name}
        type="radio"
        disabled={disabled}
        id={id}
        value={value}
        checked={value === selectedValue}
        style={{ display: 'none' }}
      />
    </label>
  );
};

export { RadioButton };
