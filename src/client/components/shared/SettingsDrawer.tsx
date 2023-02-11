import React, { useState } from 'react'
import { Collapse, Drawer } from '@mui/material';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

interface Props {
  setIsShowSettingsDrawer: (isShowSettingsDrawer: boolean) => void;
  isShowSettingsDrawer: boolean;
}

const SettingsDrawer = ({ setIsShowSettingsDrawer, isShowSettingsDrawer }: Props) => {
  const [isShowGeneralSettings, setIsShowGeneralSettings] = useState(false)
  const [isShowAirCraftSettings, setIsShowAirCraftSettings] = useState(false)
  const [isShowPersonalMinimumSettings, setIsShowPersonalMinimumSettings] = useState(false)

  return (
    <Drawer
      anchor={'right'}
      open={isShowSettingsDrawer}
      onClose={() => setIsShowSettingsDrawer(false)}
    >
      <div className='drawer__container'>
        <div className="drawer__sticky__header">
          <div className="drawer__header">
            <div className="drawer__title">Settings</div>
            <div className="drawer__description">Units, Aircraft & Personal Minimums
            </div>

          </div>
          <div className="drawer__action__buttons">
            <div className="button__container "><button className='gray__background'>Restore Settings</button></div>
            <div className="button__container"><button>Save Settings</button></div>
          </div>
        </div>

        <div className="drawer__body">


          <div onClick={() => setIsShowGeneralSettings(!isShowGeneralSettings)} className="collapsed__title__container">
            {isShowGeneralSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className='collapse__title'>General Settings</span>
          </div>
          <Collapse in={isShowGeneralSettings} timeout="auto" > 
          <div className="collapsed__container">
            <div className=''></div>
          </div>
          </Collapse>
          <div onClick={() => setIsShowAirCraftSettings(!isShowAirCraftSettings)} className="collapsed__title__container">
            {isShowAirCraftSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className='collapse__title'>AirCraft Settings</span>
          </div>
          <div onClick={() => setIsShowPersonalMinimumSettings(!isShowPersonalMinimumSettings)} className="collapsed__title__container">
            {isShowPersonalMinimumSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className='collapse__title'>Personal Minimums</span>
          </div>
        </div>

      </div>
    </Drawer>
  )
}

export default SettingsDrawer