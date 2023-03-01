import React, { ReactNode } from 'react';
import styles from './ToggleFieldWrapper.module.css';
interface Props {
  children: ReactNode;
}
export const ToggleFieldWrapper = ({ children }: Props) => {
  return <div className={styles.button__fields__container}>{children}</div>;
};
