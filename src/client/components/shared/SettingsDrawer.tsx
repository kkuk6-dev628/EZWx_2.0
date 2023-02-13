import React, { useState } from 'react'
import { Collapse, Drawer } from '@mui/material';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { SettingFieldLabel, ToggleButton, ToggleFieldWrapper } from '../settings-drawer';

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
            <RxCross2 />
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
                <SettingFieldLabel title="Home Airport" description='default home airport' />

                <div className="input__container">
                  <input type="text" placeholder='Select Airport...' />
                  <RxCross2 />
                </div>
              </div>

              <ToggleFieldWrapper >
                <SettingFieldLabel title="Temperature" description='default temperature units' />
                <ToggleButton label1='Fahrenheit' label2='Celsius' checked={false} onChange={(e) => { console.log('e', e) }} />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper >
                <SettingFieldLabel title="Time Display" description='default time display setting' />
                <ToggleButton label1='Local' label2='Zulu' checked={false} onChange={(e) => { console.log('e', e) }} />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper >
                <SettingFieldLabel title="Wind Speed" description='default wind speed units' />
                <ToggleButton label1='Miles Per Hour' label2='Knots' checked={false} onChange={(e) => { console.log('e', e) }} />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper >
                <SettingFieldLabel title="Distance" description='default distance units' />
                <ToggleButton label1='Kilometers' label2='Nautical Miles' checked={false} onChange={(e) => { console.log('e', e) }} />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper >
                <SettingFieldLabel title="Visibility" description='default visibility units' />
                <ToggleButton label1='Meters' label2='Statute Miles' checked={false} onChange={(e) => { console.log('e', e) }} />
              </ToggleFieldWrapper>

            </div>
          </Collapse>

          <div onClick={() => setIsShowAirCraftSettings(!isShowAirCraftSettings)} className="collapsed__title__container">
            {isShowAirCraftSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className='collapse__title'>AirCraft Settings</span>
          </div>
          <Collapse in={isShowAirCraftSettings} timeout="auto" >
          </Collapse>

          <div onClick={() => setIsShowPersonalMinimumSettings(!isShowPersonalMinimumSettings)} className="collapsed__title__container">
            {isShowPersonalMinimumSettings ? <AiOutlineMinus style={{ color: 'purple' }} /> : <AiOutlinePlus />}
            <span className='collapse__title'>Personal Minimums</span>
          </div>
          <Collapse in={isShowPersonalMinimumSettings} timeout="auto" >
            <hr />
          </Collapse>
        </div>

      </div>
    </Drawer>
  )
}

export default SettingsDrawer