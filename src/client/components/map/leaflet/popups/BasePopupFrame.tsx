import { Typography, Divider } from '@material-ui/core';

const BasePopupFrame = ({ title, children }) => {
  return (
    <>
      <Typography variant="subtitle2">{title}</Typography>
      <Divider />
      <div>{children}</div>
    </>
  );
};
export default BasePopupFrame;
