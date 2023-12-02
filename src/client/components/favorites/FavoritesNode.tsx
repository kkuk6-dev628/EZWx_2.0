import React from 'react';
import Typography from '@mui/material/Typography';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { NodeModel, useDragOver } from '@minoru/react-dnd-treeview';
import { TypeIcon } from './TypeIcon';
import styles from './FavoritesNode.module.css';
import { FavoritesData } from './favoritesTypes';

type Props = {
  node: NodeModel<FavoritesData>;
  depth: number;
  isOpen: boolean;
  isSelected?: boolean;
  onClick: (e) => void;
  onToggle: (id: NodeModel['id']) => void;
};

export const FavoritesNode: React.FC<Props> = (props) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleClick = () => {
    if (droppable) {
      props.onToggle(props.node.id);
    } else {
      props.onClick(props.node);
    }
  };

  const dragOverProps = useDragOver(id, props.isOpen, props.onToggle);
  return (
    <div
      className={`tree-node ${styles.root} ${props.isSelected ? styles.isSelected : ''}`}
      style={{ paddingInlineStart: indent }}
      {...dragOverProps}
      onClick={handleClick}
    >
      <div className={`${styles.expandIconWrapper} ${props.isOpen ? styles.isOpen : ''}`}>
        {props.node.droppable && (
          <div>
            <ArrowRightIcon />
          </div>
        )}
      </div>
      <div>
        <TypeIcon droppable={droppable || false} fileType={data?.fileType} />
      </div>
      <div className={styles.labelGridItem}>
        <Typography variant="body2">{props.node.text}</Typography>
      </div>
    </div>
  );
};
