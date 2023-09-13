import { Box, Modal as MUIModal } from '@mui/material';
import { ReactNode } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { SvgRoundClose } from '../utils/SvgIcons';
interface Props {
  open: boolean;
  handleClose: () => void;
  footer: ReactNode | null;
  title: string;
  description: string;
}

export const Modal = ({ open = true, handleClose, footer = null, title, description }: Props) => {
  return (
    <MUIModal className="dialog__modal" open={open} onClose={handleClose}>
      <Box className="dialog__box">
        <div className="dialog__box__heading__container">
          <h4>{title}</h4>
          <button onClick={handleClose} className="dlg-close" type="button">
            <SvgRoundClose />
          </button>
        </div>
        {description && <div className="dialog__box__body">{description}</div>}
        {footer && <div className="dialog__box__footer">{footer}</div>}
      </Box>
    </MUIModal>
  );
};
