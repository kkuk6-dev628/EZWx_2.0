import { Dialog, DialogTitle } from '@mui/material';
import { PaperComponent } from './PaperComponent';
import { ReactNode } from 'react';
import { SvgRoundClose } from '../utils/SvgIcons';

interface Props {
  open: boolean;
  onClose: () => void;
  width?: number;
  body?: ReactNode;
  footer?: ReactNode | null;
  title: string;
}

export const DraggableDlg = ({ open, onClose, body, footer, title, width }: Props) => {
  return (
    <Dialog
      PaperComponent={PaperComponent}
      hideBackdrop
      disableEnforceFocus
      style={{ position: 'absolute' }}
      open={open}
      onClose={onClose}
    >
      <div className="dialog__modal">
        <div className="dialog__box" style={{ width }}>
          <DialogTitle className="dialog__box__heading__container" style={{ cursor: 'move' }}>
            <span id="draggable-dialog-title">{title}</span>
            <button onClick={onClose} className="dlg-close" type="button">
              <SvgRoundClose />
            </button>
          </DialogTitle>
          <div className="dialog__box__body">{body}</div>
          <div className="dialog__box__footer">{footer}</div>
        </div>
      </div>
    </Dialog>
  );
};
