/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { Collapse, Drawer } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/auth/authSlice';
import { FiFilter } from 'react-icons/fi';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
//@ts-ignore
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import SavedTreeView from '../saved/SavedTreeView';

interface Props {
  onClose: (isOpen: boolean) => void;
  isOpen: boolean;
}

const FavoritesDrawer = ({ onClose, isOpen }: Props) => {
  const handleCloseDrawer = () => {
    onClose(false);
  };

  return (
    <Drawer anchor={'right'} open={isOpen} onClose={handleCloseDrawer}>
      <div className="drawer__container">
        <div className="drawer__sticky__header">
          <div className="drawer__header">
            <div className="drawer__title">Saved Items</div>
            <RxCross2 onClick={handleCloseDrawer} className="close__icon" />
            <div className="drawer__description">Routes, Airports & Imagery</div>
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
        <SavedTreeView></SavedTreeView>
      </div>
    </Drawer>
  );
};

export default FavoritesDrawer;
