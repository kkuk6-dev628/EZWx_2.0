import { Typography } from '@mui/material';
import { SvgDropDown } from '../utils/SvgIcons';

function SavedDashboardNode(props) {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 16;

  const handleClick = () => {
    props.onClick(props.node);
  };

  return (
    <div className="card-item" style={{ paddingInlineStart: indent }} onClick={handleClick}>
      <div className="item-label">
        <Typography variant="body2">
          {props.node.text + (props.numberOfChildren > 0 ? ` (${props.numberOfChildren})` : '')}
        </Typography>
      </div>
      <div className={`expandIconWrapper ${props.isOpen ? 'open' : ''}`}>
        {props.node.droppable && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              props.onToggle(id);
            }}
          >
            <SvgDropDown />
          </div>
        )}
      </div>
    </div>
  );
}
export default SavedDashboardNode;
