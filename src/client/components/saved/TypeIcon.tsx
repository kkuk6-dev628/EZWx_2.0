import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';

type Props = {
  droppable: boolean;
  fileType?: string;
};

export const TypeIcon: React.FC<Props> = (props) => {
  if (props.droppable) {
    return <FolderIcon />;
  }

  switch (props.fileType) {
    case 'route':
      return <ImageIcon />;
    case 'imagery':
      return <ListAltIcon />;
    case 'airport':
      return <DescriptionIcon />;
    default:
      return null;
  }
};
