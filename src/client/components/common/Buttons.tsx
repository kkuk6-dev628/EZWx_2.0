const PrimaryButton = ({text,...props}) => {
  return (
      <button className="button__primary" {...props}>{text}</button>
  );
};
const SecondaryButton = ({text, ...props}) => {
  return (
      <button className="button__primary gray__background" {...props}>{text}</button>
  );
};

export { PrimaryButton,SecondaryButton };
