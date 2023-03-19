import React, { useState } from 'react';
import { Collapse, Drawer } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/auth/authSlice';
import { FiFilter } from 'react-icons/fi';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Props {
  onClose: (isOpen: boolean) => void;
  isOpen: boolean;
}

const FavoritesDrawer = ({ onClose, isOpen }: Props) => {
  const { id } = useSelector(selectAuth);
  const [showFolders, setShowFolders] = useState(false);
  const [collapseState, setCollapseState] = useState({});
  const [indexes, setIndexes] = useState({ folderIndex: '', folderItemIndex: '' });

  const [folders, setFolders] = useState([
    {
      id: 'folder-1',
      name: 'My Routes',
      items: [
        { id: 'item-1', content: 'Item 1' },
        { id: 'item-2', content: 'Item 2' },
      ],
    },
    {
      id: 'folder-2',
      name: 'My Workshops',
      items: [
        { id: 'item-3', content: 'Item 3' },
        { id: 'item-4', content: 'Item 4' },
      ],
    },
    {
      id: 'folder-3',
      name: 'My Imagery',
      items: [
        { id: 'item-5', content: 'Item 5' },
        { id: 'item-6', content: 'Item 6' },
      ],
    },
  ]);
  const handleCloseDrawer = () => {
    closeDrawer();
  };

  const closeDrawer = () => {
    onClose(false);
  };

  const toggleCollapse = (name) => {
    setCollapseState((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const onDragEnd = (result) => {
    if (!result?.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceFolder = folders.find((folder) => folder.id === source.droppableId);
      const destinationFolder = folders.find((folder) => folder.id === destination.droppableId);
      const [removed] = sourceFolder.items.splice(source.index, 1);

      if (result.destination.droppableId.startsWith('folder')) {
        destinationFolder.items.splice(destination.index, 0, removed);
      } else {
        const subFolderItem = destinationFolder.items.find((item) => item.id === destination.droppableId);
        if (!subFolderItem['subItems']) {
          subFolderItem['subItems'] = [];
        }
        subFolderItem['subItems'].push(removed);
      }
      setFolders([...folders]);
    } else {
      const folder = folders.find((folder) => folder.id === source.droppableId);
      const [removed] = folder.items.splice(source.index, 1);
      folder.items.splice(destination.index, 0, removed);
      setFolders([...folders]);
    }
  };

  return (
    <Drawer anchor={'right'} open={isOpen} onClose={handleCloseDrawer}>
      <div className="drawer__container">
        <div className="drawer__sticky__header">
          <div className="drawer__header">
            <div className="drawer__title">Settings</div>
            <RxCross2 onClick={handleCloseDrawer} className="close__icon" />
            <div className="drawer__description">Units, Aircraft & Personal Minimums</div>
          </div>
          <div className="drawer__input_container">
            <div className="drawer__input__suffix">
              <FiFilter />
            </div>
            <input type="text" placeholder="Search..." />
            <div className="drawer__input__suffix">
              <RxCross2 />
            </div>
          </div>
        </div>

        <div className="drawer__body">
          <div onClick={() => setShowFolders(!showFolders)} className="root__collapse__title__container">
            {showFolders ? (
              <>
                <AiOutlineMinus /> <FaFolderOpen className="root__folder__icon" />
              </>
            ) : (
              <>
                <AiOutlinePlus /> <FaFolder className="root__folder__icon" />
              </>
            )}
            <span className="root__collapse__title">{`EZWxBrief (${folders.length})`}</span>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Collapse in={showFolders} timeout="auto" className="root__collapse">
              <div className="collapse__container__body">
                {folders.map((el, ind) => (
                  <Droppable droppableId={el.id}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <div onClick={() => toggleCollapse(el.name)} className="folder__title__container">
                          {collapseState?.[el.name] ? (
                            <FaFolderOpen className="folder__icon" />
                          ) : (
                            <FaFolder className=" folder__icon" />
                          )}
                          <span className="folder__title">{`${el.name} ${
                            el.items.length > 0 ? `(${el.items.length})` : ''
                          }`}</span>
                        </div>
                        <Collapse in={collapseState?.[el.name] || false}>
                          <div className="collapse__container__body">
                            {el.items.map((item, itemIndex) => (
                              <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                    className="folder__title__container"
                                  >
                                    {item.content}
                                    {item && item?.['subItems'] && (
                                      <Droppable droppableId={item.id} key={item.id}>
                                        {(provided) => (
                                          <div ref={provided.innerRef} {...provided.droppableProps}>
                                            {item &&
                                              item?.['subItems'].map((subItem, subIndex) => {
                                                console.log('subItem', subItem);
                                                return (
                                                  <Draggable key={subItem.id} draggableId={subItem.id} index={subIndex}>
                                                    {(provided) => (
                                                      <div
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        ref={provided.innerRef}
                                                        style={{
                                                          ...provided.draggableProps.style,
                                                          background: 'lightgrey',
                                                          padding: '5px',
                                                          marginBottom: '5px',
                                                          borderRadius: '5px',
                                                        }}
                                                      >
                                                        {subItem.content}
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                );
                                              })}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        </Collapse>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </Collapse>
          </DragDropContext>
        </div>
      </div>
    </Drawer>
  );
};

export default FavoritesDrawer;
