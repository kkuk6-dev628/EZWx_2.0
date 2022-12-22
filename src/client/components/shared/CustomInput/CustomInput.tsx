import React from 'react';

interface CustomInputProps {
  inputName: string;
  id: string;
  placeholder: string;
  label: string;
  txt: string;
}

function CustomInput({
  inputName,
  id,
  placeholder,
  label,
  txt,
}: CustomInputProps) {
  return (
    <div className="csuinp">
      <label htmlFor="email" className="csuinp__lbl">
        Email
      </label>
      <input
        type="email"
        name="email"
        id="email"
        className="csuinp__input"
        placeholder="Email for Verification"
      />
      <p className="csuinp__txt">The email address you registered with</p>
    </div>
  );
}

export default CustomInput;
