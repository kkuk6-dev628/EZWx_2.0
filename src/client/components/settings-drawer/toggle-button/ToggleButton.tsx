import React, { ChangeEvent, useState } from "react";
import styles from './ToggleButton.module.css'
type InputEvent = ChangeEvent<HTMLInputElement>;

interface ToggleProps {
  label1: string;
  label2: string;
  checked: boolean;
  onChange: (e: InputEvent) => void;
}

const ToggleButton = ({ label1, label2, checked, onChange }: ToggleProps) => {
  const [toggle, setToggle] = useState(checked);

  const handleToggle = (e: InputEvent) => {
    setToggle(!toggle);
    onChange(e)
  };

  return (
    <div className="toggle__container">
      <input type="checkbox" id={label1} onChange={handleToggle} />
      <div className="toggle__labels">
        <label htmlFor={label1} className={styles.toggle__label1}>
          {label1}
        </label>
        <label className={styles.toggle__box} htmlFor={label1}></label>
        <label htmlFor={label1} className={styles.toggle__label2}>
          {label2}
        </label>
      </div>
      <style jsx>{`
        .toggle__container {
          width: 130px;
          height: 34px;
          display: flex;
          border:1px solid;
          border-color:${toggle ? "var(--color-yellow)" : "var(--color-primary)"};
          justify-content: center;
          align-items: center;
          border-radius: 5px;
          position: relative;
          background-color:${toggle ? "var(--color-yellow)" : "var(--color-primary)"};
          box-shadow: ${toggle ? "0 2px 6px 0 rgb(255 194 65 / 50%)" : "0 2px 6px 0 rgb(136 106 181 / 50%)"};
          transition: all 0.3s ease-in-out;
          overflow: hidden;
        }
  
        .toggle__container input[type="checkbox"] {
          display: none;
        }
  
        .toggle__labels {
          display: flex;
          flex-direction: row;
          align-items: center;
          border:none;
          width: 200%;
          height: 100%;
          position: absolute;
          background:transparent;
          left: ${toggle ? "0" : "-100%"};
          transition: all 0.3s ease-in-out;
        }
  
        
      `}</style>
    </div >
  );
};

export { ToggleButton };
