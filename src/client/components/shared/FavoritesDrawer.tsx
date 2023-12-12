/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { Drawer } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { FiFilter } from 'react-icons/fi';
import SavedTreeView from '../saved/SavedTreeView';

interface Props {
  onClose: (isOpen: boolean) => void;
  isOpen: boolean;
}

const FavoritesDrawer = ({ onClose, isOpen }: Props) => {
  const [filter, setFilter] = useState('');
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
            <input type="text" value={filter} placeholder="Search..." onChange={(e) => setFilter(e.target.value)} />
            <div className="drawer__input__suffix" onClick={() => setFilter('')}>
              <RxCross2 />
            </div>
          </div>
        </div>
        <SavedTreeView handleCloseDrawer={handleCloseDrawer} filter={filter}></SavedTreeView>
      </div>
    </Drawer>
  );
};

export default FavoritesDrawer;
