import React, { useEffect, useRef, useState } from 'react';
import { CircularProgress, Collapse, Drawer, Typography } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/auth/authSlice';
import { FiFilter } from 'react-icons/fi';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';

interface Props {
  onClose: (isOpen: boolean) => void;
  isOpen: boolean;
}

const FavoritesDrawer = ({ onClose, isOpen }: Props) => {
  const { id } = useSelector(selectAuth);
  const [showFolders, setShowFolders] = useState(false);
  const [collapseState, setCollapseState] = useState({});
  const dummyFolders = [
    {
      name: 'My 7-Day Forecasts',
      items: ['first', 'second', 'third'],
    },
    {
      name: 'My Airports',
      items: [],
    },
    {
      name: 'My Imagery',
      items: [],
    },
    {
      name: 'My Routes',
      items: [],
    },
    {
      name: 'My Workshops',
      items: [],
    },
  ];

  const handleCloseDrawer = () => {
    closeDrawer();
  };

  const closeDrawer = () => {
    onClose(false);
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
            <span className="root__collapse__title">{`EZWxBrief (${dummyFolders.length})`}</span>
          </div>
          <Collapse in={showFolders} timeout="auto" className="root__collapse">
            <div className="collapse__container__body">
              {dummyFolders.map((el) => (
                <>
                  <div
                    onClick={() =>
                      setCollapseState((prev) => ({
                        ...prev,
                        [el.name]: !prev[el.name],
                      }))
                    }
                    className="folder__title__container"
                  >
                    {collapseState?.[el.name] ? (
                      <FaFolderOpen className="folder__icon" />
                    ) : (
                      <FaFolder className=" folder__icon" />
                    )}
                    <span className="folder__title">{`${el.name} ${
                      el.items.length > 0 && `(${el.items.length})`
                    }`}</span>
                  </div>
                  <Collapse in={collapseState?.[el.name] || false}>
                    <div className="collapse__container__body">
                      {el.items.map((item) => (
                        <Typography className="folder__title__container">{item}</Typography>
                      ))}
                    </div>
                  </Collapse>
                </>
              ))}
            </div>
          </Collapse>
        </div>
      </div>
    </Drawer>
  );
};

export default FavoritesDrawer;
