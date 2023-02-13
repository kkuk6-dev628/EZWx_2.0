import React from 'react'
import styles from './SettingFieldLabel.module.css'

interface FieldProps {
  title: string;
  description: string;
}

export const SettingFieldLabel = ({ title, description }: FieldProps) => {
  return (
    <div className={styles.text__container}>
      <div className={styles.field__title}>{title}</div>
      <div className={styles.field__description}>{description}</div>
    </div>
  )
}
