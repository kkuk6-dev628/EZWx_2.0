import { CircularProgress } from '@mui/material';

const PrimaryButton = ({ text, isLoading, ...props }) => {
  return (
    <button className="button__primary" disabled={isLoading} {...props}>
      {text}
    </button>
  );
};
const SecondaryButton = ({ text, isLoading, ...props }) => {
  return (
    <button className="button__primary gray__background" disabled={isLoading} {...props}>
      {text} {true && <CircularProgress size={10} sx={{ color: 'white' }} />}
    </button>
  );
};

export { PrimaryButton, SecondaryButton };
