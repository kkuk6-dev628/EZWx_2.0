import React, { useRef, useState } from 'react';
import { Collapse, Drawer } from '@mui/material';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import {
  InputFieldWrapper,
  RadioButton,
  SettingFieldLabel,
  ToggleButton,
  ToggleFieldWrapper,
} from '../settings-drawer';
import { StyledSlider } from './Slider';
import RangeSlider from './RangeSlider';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';

interface Props {
  setIsShowSettingsDrawer: (isShowSettingsDrawer: boolean) => void;
  isShowSettingsDrawer: boolean;
}

const SettingsDrawer = ({ setIsShowSettingsDrawer, isShowSettingsDrawer }: Props) => {
  const settingsState = useSelector(selectSettings);
  const [isShowGeneralSettings, setIsShowGeneralSettings] = useState(false);
  const [isShowAirCraftSettings, setIsShowAirCraftSettings] = useState(false);
  const [isShowPersonalMinimumSettings, setIsShowPersonalMinimumSettings] = useState(false);

  const [settings, setSettings] = useState(settingsState);
  const [radio, setRadio] = useState('');
  const [rangeSlider, setRangeSlider] = useState([2, 6]);
  console.log('state', settingsState);
  const closeDrawer = () => {
    setIsShowSettingsDrawer(false);
  };

  const handleChange = (e) => {
    console.log('e', e);
  };

  return (
    <Drawer anchor={'right'} open={isShowSettingsDrawer} onClose={closeDrawer}>
      <div className="drawer__container">
        <div className="drawer__sticky__header">
          <div className="drawer__header">
            <div className="drawer__title">Settings</div>
            <RxCross2 onClick={closeDrawer} className="close__icon" />
            <div className="drawer__description">Units, Aircraft & Personal Minimums</div>
          </div>
          <div className="drawer__action__buttons">
            <div className="button__container ">
              <button className="gray__background">Restore Settings</button>
            </div>
            <div className="button__container">
              <button>Save Settings</button>
            </div>
          </div>
        </div>

        <div className="drawer__body">
          {/* general Settings */}

          <div onClick={() => setIsShowGeneralSettings(!isShowGeneralSettings)} className="collapsed__title__container">
            {isShowGeneralSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className="collapse__title">General Settings</span>
          </div>
          <Collapse in={isShowGeneralSettings} timeout="auto">
            <div className="collapsed__container">
              <InputFieldWrapper>
                <SettingFieldLabel title="Home Airport" description="default home airport" />

                <div className="input__container">
                  <input
                    name="default_home_airport"
                    value={settings.default_home_airport}
                    type="text"
                    placeholder="Select Airport..."
                  />
                  <RxCross2 />
                </div>
              </InputFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Temperature" description="default temperature units" />
                <ToggleButton
                  label1="Fahrenheit"
                  label2="Celsius"
                  checked={false}
                  onChange={(e) => {
                    console.log('e', e);
                  }}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Time Display" description="default time display setting" />
                <ToggleButton
                  label1="Local"
                  label2="Zulu"
                  checked={false}
                  onChange={(e) => {
                    console.log('e', e);
                  }}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Wind Speed" description="default wind speed units" />
                <ToggleButton
                  label1="Miles Per Hour"
                  label2="Knots"
                  checked={false}
                  onChange={(e) => {
                    console.log('e', e);
                  }}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Distance" description="default distance units" />
                <ToggleButton
                  label1="Kilometers"
                  label2="Nautical Miles"
                  checked={false}
                  onChange={(e) => {
                    console.log('e', e);
                  }}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Visibility" description="default visibility units" />
                <ToggleButton
                  label1="Meters"
                  label2="Statute Miles"
                  checked={false}
                  onChange={(e) => {
                    console.log('e', e);
                  }}
                />
              </ToggleFieldWrapper>
            </div>
          </Collapse>

          {/* Aircraft settings */}

          <div
            onClick={() => setIsShowAirCraftSettings(!isShowAirCraftSettings)}
            className="collapsed__title__container"
          >
            {isShowAirCraftSettings ? <AiOutlineMinus /> : <AiOutlinePlus />}
            <span className="collapse__title">AirCraft Settings</span>
          </div>
          <Collapse in={isShowAirCraftSettings} timeout="auto">
            <div className="collapsed__container">
              <InputFieldWrapper>
                <SettingFieldLabel title="Takeoff weight category" description="maximum takeoff weight category" />
                <div className="input_radio_container">
                  <RadioButton
                    id="lightWeight"
                    value={'light'}
                    title="Light"
                    selectedValue={radio}
                    description={'(< 15,500 lbs)'}
                    onChange={(e) => setRadio(e.target.value)}
                  />
                  <RadioButton
                    id="mediumWeight"
                    value="medium"
                    title="Medium"
                    selectedValue={radio}
                    description={'(15,500 - 300,000 lbs)'}
                    onChange={(e) => setRadio(e.target.value)}
                  />
                  <RadioButton
                    id="heavyWeight"
                    value="heavy"
                    title="Heavy"
                    selectedValue={radio}
                    description={'(> 300,000 lbs)'}
                    onChange={(e) => setRadio(e.target.value)}
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel title="True Airspeed" description="true airspeed for en route operations (knots)" />
                <StyledSlider />
              </InputFieldWrapper>
            </div>
          </Collapse>

          {/* Personal Minimums settings  */}

          <div
            onClick={() => setIsShowPersonalMinimumSettings(!isShowPersonalMinimumSettings)}
            className="collapsed__title__container"
          >
            {isShowPersonalMinimumSettings ? <AiOutlineMinus style={{ color: 'purple' }} /> : <AiOutlinePlus />}
            <span className="collapse__title">Personal Minimums</span>
          </div>
          <Collapse in={isShowPersonalMinimumSettings} timeout="auto">
            <div className="collapsed__container">
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Ceiling at Departure"
                  description="acceptable ceiling at departure airport (ft agl)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '100', value: 100 },
                    ]}
                    max={6000}
                    min={0}
                    value={rangeSlider}
                    track="normal"
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility at Departure"
                  description="acceptable surface visibility at departure airport (statute miles)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 0 },
                    ]}
                    max={12}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Crosswinds at Departure Airport"
                  description="acceptable crosswind at departure airport (knots)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '35', value: 35 },
                      { label: '0', value: 0 },
                    ]}
                    max={35}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Ceiling Along Route"
                  description="acceptable ceiling along proposed route (ft agl)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '0', value: 0 },
                    ]}
                    max={6000}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility Along Route"
                  description="acceptable surface visibility along proposed route (statute miles)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 0 },
                    ]}
                    max={12}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel title="En Route Icing Probability" description="acceptable icing probabilty (%)" />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 0 },
                    ]}
                    max={12}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel title="En Route Icing Probability" description="acceptable icing probabilty (%)" />
                <div className="range__slider">
                  <RangeSlider
                    onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={2}
                    marks={[
                      { label: 'Hvy', value: 8 },
                      { label: 'Mod', value: 6 },
                      { label: 'Lgt', value: 4 },
                      { label: 'Trc', value: 2 },
                      { label: 'None', value: 0 },
                    ]}
                    step={2}
                    max={8}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="off"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="En Route Turbulence Intensity"
                  description="acceptable turbulence intensity (edr * 100)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={10}
                    marks={[
                      { label: '100', value: 100 },
                      { label: '0', value: 0 },
                    ]}
                    max={100}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="En Route Convective Potential"
                  description="acceptable convective potential"
                />
                <div className="range__slider">
                  <RangeSlider
                    onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={2}
                    marks={[
                      { label: 'Vry Hi', value: 10 },
                      { label: 'Hi', value: 8 },
                      { label: 'M3d', value: 6 },
                      { label: 'Lo', value: 4 },
                      { label: 'Vry Lo', value: 2 },
                      { label: 'None', value: 0 },
                    ]}
                    step={2}
                    max={10}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="off"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Ceiling at Destination"
                  description="acceptable ceiling at destination airport (ft agl)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '0', value: 0 },
                    ]}
                    max={6000}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility at Destination"
                  description="acceptable surface visibility at the destination airport (statute miles)"
                />
                <div className="range__slider">
                  <RangeSlider
                    onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={1}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 0 },
                    ]}
                    max={12}
                    min={0}
                    step={0.5}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Crosswinds at Destination Airport"
                  description="acceptable crosswind at destination airport (knots)"
                />
                <div className="range__slider">
                  <RangeSlider
                    // onChange={(e) => setRangeSlider(e.target.value)}
                    mindistance={100}
                    marks={[
                      { label: '35', value: 35 },
                      { label: '0', value: 0 },
                    ]}
                    max={35}
                    min={0}
                    value={rangeSlider}
                    valueLabelDisplay="on"
                    component={null}
                    disableSwap
                  />
                </div>
              </InputFieldWrapper>
            </div>
          </Collapse>
          <hr />
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
