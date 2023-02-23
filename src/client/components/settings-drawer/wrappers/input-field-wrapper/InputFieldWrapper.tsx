import React from 'react';
import styles from './InputFieldWrapper.module.css';
const InputFieldWrapper = ({ children }) => {
  return <div className={styles.fieldWrapper}>{children}</div>;
};

export { InputFieldWrapper };
