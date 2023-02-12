import React, { useState } from 'react'
import { Collapse, Drawer } from '@mui/material';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';

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

              <div className='input__fields__container'>
                <div className="text__container">
                  <div className="field__title">Home Airport</div>
                  <div className="field__description">default home airport</div>
                </div>
                <div className="input__container">
                  <input type="text" placeholder='Select Airport...' />
                  <RxCross2 />
                </div>
              </div>

              <div className='button__fields__container'>
                <div className="text__container">
                  <div className="field__title">Temperature</div>
                  <div className="field__description">default temperature units</div>
                </div>

              </div>

            </div>
          </Collapse>
          <div onClick={() => setIsShowAirCraftSettings(!isShowAirCraftSettings)} className="collapsed__title__container">
            {isShowAirCraftSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className='collapse__title'>AirCraft Settings</span>
          </div>
          <div onClick={() => setIsShowPersonalMinimumSettings(!isShowPersonalMinimumSettings)} className="collapsed__title__container">
            {isShowPersonalMinimumSettings ? <AiOutlineMinus style={{ color: 'purple' }} /> : <AiOutlinePlus />}
            <span className='collapse__title'>Personal Minimums</span>
          </div>
        </div>

      </div>
    </Drawer>
  )
}

export default SettingsDrawer