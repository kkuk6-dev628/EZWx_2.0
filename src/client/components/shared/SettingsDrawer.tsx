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
import { AutoCompleteInput, Modal, PrimaryButton, SecondaryButton } from '../common';
import { ColoredRangeSlider, formatForDecimal, formatForInteger } from '../common/ColoredRangeSlider';

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

  const handleChange = (name, value) => {
    setSettings({ ...settings, [name]: value });
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
                  <AutoCompleteInput
                    name="default_home_airport"
                    selectedValue={settings.default_home_airport}
                    handleAutoComplete={(name, value) => {
                      setSettings({ ...settings, [name]: value && value.key ? value.key : value });
                    }}
                    exceptions={[]}
                    key={'home-airport'}
                    // handleCloseSuggestion={handleCloseSuggestion}
                    // showSuggestion={formData[DESTINATION_SUGGESTION]}
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
            <span className="collapse__title">Aircraft Settings</span>
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
                  <ColoredRangeSlider
                    start={settings.ceiling_at_departure}
                    step={100}
                    connect={[true, true, true]}
                    range={{ min: 100, max: 6000 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 100,
                    }}
                    direction="rtl"
                    margin={1000}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('ceiling_at_departure', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility at Departure"
                  description="acceptable surface visibility at departure airport (statute miles)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.surface_visibility_at_departure}
                    step={0.5}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 15 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      density: 0.5,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('surface_visibility_at_departure', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Crosswinds at Departure Airport"
                  description="acceptable crosswind at departure airport (knots)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.crosswinds_at_departure_airport}
                    step={1}
                    connect={[true, true, true]}
                    range={{ min: 1, max: 50 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      density: 1,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('crosswinds_at_departure_airport', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Ceiling Along Route"
                  description="acceptable ceiling along proposed route (ft agl)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.ceiling_along_route}
                    step={100}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 6000 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 100,
                    }}
                    direction="rtl"
                    margin={1000}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('ceiling_along_route', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility Along Route"
                  description="acceptable surface visibility along proposed route (statute miles)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.surface_visibility_along_route}
                    step={0.5}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 15 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      density: 0.5,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('surface_visibility_along_route', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel title="En Route Icing Probability" description="acceptable icing probabilty (%)" />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.en_route_icing_probability}
                    step={1}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 100 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 1,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('en_route_icing_probability', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel title="En Route Icing Intensity" description="acceptable icing intensity" />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.en_route_icing_intensity}
                    step={2}
                    connect={[true, true, true]}
                    range={{ min: 2, max: 10 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      values: [2, 4, 6, 8, 10],
                      density: 2,
                    }}
                    direction="rtl"
                    margin={2}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('en_route_icing_intensity', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="En Route Turbulence Intensity"
                  description="acceptable turbulence intensity (edr * 100)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.en_route_turbulence_intensity}
                    step={1}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 100 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 1,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('en_route_turbulence_intensity', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="En Route Convective Potential"
                  description="acceptable convective potential"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.en_route_convective_potential}
                    step={2}
                    connect={[true, true, true]}
                    range={{ min: 2, max: 12 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      density: 2,
                    }}
                    direction="rtl"
                    margin={2}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('en_route_convective_potential', values);
                    }}
                  />
                  {/* <RangeSlider
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
                  /> */}
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Ceiling at Destination"
                  description="acceptable ceiling at destination airport (ft agl)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.ceiling_at_destination}
                    step={100}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 6000 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 100,
                    }}
                    direction="rtl"
                    margin={1000}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('ceiling_at_destination', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>

              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Surface Visibility at Destination"
                  description="acceptable surface visibility at the destination airport (statute miles)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.surface_visibility_at_destination}
                    step={0.5}
                    connect={[true, true, true]}
                    range={{ min: 0, max: 15 }}
                    tooltips={[true, true]}
                    format={formatForDecimal}
                    pips={{
                      mode: 'range',
                      density: 0.5,
                    }}
                    direction="rtl"
                    margin={1}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('surface_visibility_at_destination', values);
                    }}
                  />
                </div>
              </InputFieldWrapper>
              <InputFieldWrapper>
                <SettingFieldLabel
                  title="Crosswinds at Destination Airport"
                  description="acceptable crosswind at destination airport (knots)"
                />
                <div className="range__slider">
                  <ColoredRangeSlider
                    start={settings.crosswinds_at_destination_airport}
                    step={1}
                    connect={[true, true, true]}
                    range={{ min: 1, max: 50 }}
                    tooltips={[true, true]}
                    format={formatForInteger}
                    pips={{
                      mode: 'range',
                      density: 1,
                    }}
                    direction="rtl"
                    margin={2}
                    connectClasses={['green', 'yellow', 'red']}
                    onChange={(values) => {
                      handleChange('crosswinds_at_destination_airport', values);
                    }}
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
