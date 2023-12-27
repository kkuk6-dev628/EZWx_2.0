import { Dialog, DialogTitle } from '@mui/material';
import { PaperComponent } from './PaperComponent';
import { ReactNode } from 'react';
import { SvgRoundClose } from '../utils/SvgIcons';

interface Props {
  open: boolean;
  onClose: () => void;
  width?: number;
  toolButtons?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  title: string;
}

export const DraggableDlg = ({ open, onClose, toolButtons, body, footer, title, width }: Props) => {
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
          {toolButtons && <div className="dialog__box__toolbuttons">{toolButtons}</div>}
          <div className="dialog__box__body">{body}</div>
          <div className="dialog__box__footer">{footer}</div>
        </div>
      </div>
    </Dialog>
  );
};
