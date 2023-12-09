import React from 'react';
import { Icon } from '@iconify/react';

type Props = {
  isRoot: boolean;
  droppable: boolean;
  isOpen: boolean;
  fileType?: string;
};

export const TypeIcon: React.FC<Props> = (props) => {
  if (props.droppable) {
    return (
      <Icon
        icon={props.isOpen ? 'el:folder-open' : 'el:folder-close'}
        width="20"
        color={props.isRoot ? 'var(--color-primary)' : '#008080'}
      />
    );
  }

  switch (props.fileType) {
    case 'route':
      return <Icon icon="fa6-solid:route" width="20" />;
    case 'imagery':
      return <Icon icon="pajamas:doc-image" width="20" />;
    case 'airport':
      return <Icon icon="mdi:airport" width="20" />;
    default:
      return null;
  }
};
