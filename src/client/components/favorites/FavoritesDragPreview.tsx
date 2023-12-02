import React from 'react';
import { DragLayerMonitorProps } from '@minoru/react-dnd-treeview';
import { TypeIcon } from './TypeIcon';
import styles from './FavoritesDragPreview.module.css';
import { FavoritesData } from './favoritesTypes';

type Props = {
  monitorProps: DragLayerMonitorProps<FavoritesData>;
};

export const FavoritesDragPreview: React.FC<Props> = (props) => {
  const item = props.monitorProps.item;

  return (
    <div className={styles.root}>
      <div className={styles.icon}>
        <TypeIcon droppable={item.droppable || false} fileType={item?.data?.fileType} />
      </div>
      <div className={styles.label}>{item.text}</div>
    </div>
  );
};
