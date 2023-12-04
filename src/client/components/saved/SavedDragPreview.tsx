import React from 'react';
import { DragLayerMonitorProps } from '@minoru/react-dnd-treeview';
import { TypeIcon } from './TypeIcon';
import styles from './SavedDragPreview.module.css';
import { SavedItemData } from '../../interfaces/saved';

type Props = {
  monitorProps: DragLayerMonitorProps<SavedItemData>;
};

export const SavedDragPreview: React.FC<Props> = (props) => {
  const item = props.monitorProps.item;

  return (
    <div className={styles.root}>
      <div className={styles.icon}>
        <TypeIcon droppable={item.droppable || false} fileType={item?.data?.type} />
      </div>
      <div className={styles.label}>{item.text}</div>
    </div>
  );
};
