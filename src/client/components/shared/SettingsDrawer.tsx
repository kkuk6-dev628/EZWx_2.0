import React, { useEffect, useRef, useState } from 'react';
import { CircularProgress, Collapse, Drawer } from '@mui/material';
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
import {
  useGetUserSettingsQuery,
  useRestoreSettingsMutation,
  useUpdateUserSettingsMutation,
} from '../../store/user/userSettingsApi';
import { selectAuth } from '../../store/auth/authSlice';
import { Modal, PrimaryButton, SecondaryButton } from '../common';

interface Props {
  setIsShowSettingsDrawer: (isShowSettingsDrawer: boolean) => void;
  isShowSettingsDrawer: boolean;
}

const SettingsDrawer = ({ setIsShowSettingsDrawer, isShowSettingsDrawer }: Props) => {
  const settingsState = useSelector(selectSettings);
  const { id } = useSelector(selectAuth);
  const [isShowGeneralSettings, setIsShowGeneralSettings] = useState(false);
  const [isShowAirCraftSettings, setIsShowAirCraftSettings] = useState(false);
  const [isShowPersonalMinimumSettings, setIsShowPersonalMinimumSettings] = useState(false);
  const [isShowRestoreSettingModal, setIsShowRestoreSettingModal] = useState(false);
  const [isShowSaveSettingModal, setIsShowSaveSettingModal] = useState(false);
  const [settings, setSettings] = useState(settingsState);

  useGetUserSettingsQuery(id);
  const [updateUserSettings, { isLoading: isUpdating, isSuccess }] = useUpdateUserSettingsMutation();
  const [restoreSettings, { isLoading: isRestoring }] = useRestoreSettingsMutation();

  useEffect(() => {
    if (settingsState) setSettings(settingsState);
  }, [settingsState]);

  useEffect(() => {
    if (!isRestoring || isUpdating) {
      setIsShowSaveSettingModal(false);
      setIsShowRestoreSettingModal(false);
    }
  }, [isRestoring, isUpdating]);

  const handleCloseDrawer = () => {
    if (JSON.stringify(settings) !== JSON.stringify(settingsState)) {
      setIsShowSaveSettingModal(true);
    } else {
      closeDrawer();
    }
  };
  const closeDrawer = () => {
    setSettings(settingsState);
    setIsShowSaveSettingModal(false);
    setIsShowSettingsDrawer(false);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.checked });
  };

  const handleSaveSettings = async (isCloseDrawer = false) => {
    if (id) {
      await updateUserSettings({ ...settings, user_id: id });
      if (isCloseDrawer) {
        setIsShowSettingsDrawer(false);
      }
    }
  };

  return (
    <Drawer anchor={'right'} open={isShowSettingsDrawer} onClose={handleCloseDrawer}>
      <div className="drawer__container">
        <div className="drawer__sticky__header">
          <div className="drawer__header">
            <div className="drawer__title">Settings</div>
            <RxCross2 onClick={handleCloseDrawer} className="close__icon" />
            <div className="drawer__description">Units, Aircraft & Personal Minimums</div>
          </div>
          <div className="drawer__action__buttons">
            <div className="button__container ">
              <button className="gray__background" onClick={() => setIsShowRestoreSettingModal(true)}>
                Restore Settings
              </button>
            </div>
            <div className="button__container">
              <button onClick={() => handleSaveSettings(false)}>
                Save Settings {isUpdating && <CircularProgress size={10} sx={{ color: 'white' }} />}
              </button>
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
                    onChange={handleChange}
                    type="text"
                    placeholder="Select Airport..."
                  />
                  <RxCross2
                    className="cancel__icon__button"
                    onClick={() => handleChange({ target: { name: 'default_home_airport', value: '' } })}
                  />
                </div>
              </InputFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Temperature" description="default temperature units" />
                <ToggleButton
                  label1="Fahrenheit"
                  label2="Celsius"
                  name="default_temperature_unit"
                  checked={settings.default_temperature_unit}
                  onChange={handleToggle}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Time Display" description="default time display setting" />
                <ToggleButton
                  label1="Local"
                  label2="Zulu"
                  name="default_time_display_unit"
                  checked={settings.default_time_display_unit}
                  onChange={handleToggle}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Wind Speed" description="default wind speed units" />
                <ToggleButton
                  label1="Miles Per Hour"
                  label2="Knots"
                  name="default_wind_speed_unit"
                  checked={settings.default_wind_speed_unit}
                  onChange={handleToggle}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Distance" description="default distance units" />
                <ToggleButton
                  label1="Kilometers"
                  label2="Nautical Miles"
                  name="default_distance_unit"
                  checked={settings.default_distance_unit}
                  onChange={handleToggle}
                />
              </ToggleFieldWrapper>

              <ToggleFieldWrapper>
                <SettingFieldLabel title="Visibility" description="default visibility units" />
                <ToggleButton
                  label1="Meters"
                  label2="Statute Miles"
                  name="default_visibility_unit"
                  checked={settings.default_visibility_unit}
                  onChange={handleToggle}
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
                    name="max_takeoff_weight_category"
                    selectedValue={settings.max_takeoff_weight_category}
                    description={'(< 15,500 lbs)'}
                    onChange={handleChange}
                  />
                  <RadioButton
                    id="mediumWeight"
                    value="medium"
                    title="Medium"
                    name="max_takeoff_weight_category"
                    selectedValue={settings.max_takeoff_weight_category}
                    description={'(15,500 - 300,000 lbs)'}
                    onChange={handleChange}
                  />
                  <RadioButton
                    id="heavyWeight"
                    value="heavy"
                    title="Heavy"
                    name="max_takeoff_weight_category"
                    selectedValue={settings.max_takeoff_weight_category}
                    description={'(> 300,000 lbs)'}
                    onChange={handleChange}
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel title="True Airspeed" description="true airspeed for en route operations (knots)" />
                <StyledSlider onChange={handleChange} name="true_airspeed" value={settings.true_airspeed} />
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
                    name="ceiling_at_departure"
                    value={settings.ceiling_at_departure}
                    mindistance={100}
                    onChange={handleChange}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '100', value: 100 },
                    ]}
                    max={6000}
                    min={100}
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
                    name="surface_visibility_at_departure"
                    value={settings.surface_visibility_at_departure}
                    onChange={handleChange}
                    mindistance={2}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 2 },
                    ]}
                    max={12}
                    min={2}
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
                    name="crosswinds_at_departure_airport"
                    value={settings.crosswinds_at_departure_airport}
                    onChange={handleChange}
                    mindistance={5}
                    marks={[
                      { label: '35', value: 35 },
                      { label: '0', value: 3 },
                    ]}
                    max={35}
                    min={3}
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
                    name="ceiling_along_route"
                    value={settings.ceiling_along_route}
                    onChange={handleChange}
                    mindistance={100}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '0', value: 100 },
                    ]}
                    max={6000}
                    min={100}
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
                    name="surface_visibility_along_route"
                    value={settings.surface_visibility_along_route}
                    onChange={handleChange}
                    mindistance={2}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 2 },
                    ]}
                    max={12}
                    min={2}
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
                    name="en_route_icing_probability"
                    value={settings.en_route_icing_probability}
                    onChange={handleChange}
                    mindistance={2}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 2 },
                    ]}
                    max={12}
                    min={2}
                    valueLabelDisplay="on"
                    component={null}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="En Route Icing Intensity"
                  description="acceptable icing intensity
"
                />
                <div className="range__slider">
                  <RangeSlider
                    name="en_route_icing_intensity"
                    value={settings.en_route_icing_intensity}
                    onChange={handleChange}
                    mindistance={2}
                    marks={[
                      { label: 'Hvy', value: 10 },
                      { label: 'Mod', value: 8 },
                      { label: 'Lgt', value: 6 },
                      { label: 'Trc', value: 4 },
                      { label: 'None', value: 2 },
                    ]}
                    step={2}
                    max={10}
                    min={2}
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
                    name="en_route_turbulence_intensity"
                    value={settings.en_route_turbulence_intensity}
                    onChange={handleChange}
                    mindistance={10}
                    marks={[
                      { label: '100', value: 100 },
                      { label: '0', value: 5 },
                    ]}
                    max={100}
                    min={5}
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
                    name="en_route_convective_potential"
                    value={settings.en_route_convective_potential}
                    onChange={handleChange}
                    mindistance={2}
                    marks={[
                      { label: 'Vry Hi', value: 12 },
                      { label: 'Hi', value: 10 },
                      { label: 'M3d', value: 8 },
                      { label: 'Lo', value: 6 },
                      { label: 'Vry Lo', value: 4 },
                      { label: 'None', value: 2 },
                    ]}
                    step={2}
                    max={12}
                    min={2}
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
                    name="ceiling_at_destination"
                    value={settings.ceiling_at_destination}
                    onChange={handleChange}
                    mindistance={100}
                    marks={[
                      { label: '6000', value: 6000 },
                      { label: '0', value: 100 },
                    ]}
                    max={6000}
                    min={100}
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
                    name="surface_visibility_at_destination"
                    value={settings.surface_visibility_at_destination}
                    onChange={handleChange}
                    mindistance={1}
                    marks={[
                      { label: '12', value: 12 },
                      { label: '0', value: 2 },
                    ]}
                    max={12}
                    min={2}
                    step={0.5}
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
                    name="crosswinds_at_destination_airport"
                    value={settings.crosswinds_at_destination_airport}
                    onChange={handleChange}
                    mindistance={5}
                    marks={[
                      { label: '35', value: 35 },
                      { label: '0', value: 3 },
                    ]}
                    max={35}
                    min={3}
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
      <Modal
        open={isShowRestoreSettingModal}
        handleClose={() => setIsShowRestoreSettingModal(false)}
        title="Restore settings confirmation"
        description="Are you sure you want to restore these settings back to the factory default?"
        footer={
          <>
            <PrimaryButton text="Cancel" onClick={() => setIsShowRestoreSettingModal(false)} isLoading={false} />
            <SecondaryButton text="Restore Settings" onClick={() => restoreSettings(id)} isLoading={isRestoring} />
          </>
        }
      />
      <Modal
        open={isShowSaveSettingModal}
        handleClose={() => setIsShowSaveSettingModal(false)}
        title="Some changes have not been saved!"
        description="You have changes to your settings that have not been saved. Do you want to save these changes?"
        footer={
          <>
            <SecondaryButton onClick={closeDrawer} text="Abandon and close" isLoading={false} />
            <PrimaryButton text="Save and close" onClick={() => handleSaveSettings(true)} isLoading={isUpdating} />
          </>
        }
      />
    </Drawer>
  );
};

export default SettingsDrawer;
