import React from 'react';
import Typography from '@mui/material/Typography';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { NodeModel, useDragOver } from '@minoru/react-dnd-treeview';
import { TypeIcon } from './TypeIcon';
import styles from './SavedNode.module.css';
import { SavedItemData } from '../../interfaces/saved';

type Props = {
  node: NodeModel<SavedItemData>;
  depth: number;
  isOpen: boolean;
  isSelected?: boolean;
  numberOfChildren: number;
  onClick: (e) => void;
  onToggle: (id: NodeModel['id']) => void;
};

export const SavedNode: React.FC<Props> = (props) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const handleClick = () => {
    props.onClick(props.node);
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
          <div
            onClick={(e) => {
              e.stopPropagation();
              props.onToggle(id);
            }}
          >
            <ArrowRightIcon />
          </div>
        )}
      </div>
      <div>
        <TypeIcon isRoot={id === 1} droppable={droppable || false} isOpen={props.isOpen} fileType={data?.type} />
      </div>
      <div className={styles.labelGridItem}>
        <Typography variant="body2">
          {props.node.text + (props.numberOfChildren > 0 ? ` (${props.numberOfChildren})` : '')}
        </Typography>
      </div>
    </div>
  );
};
