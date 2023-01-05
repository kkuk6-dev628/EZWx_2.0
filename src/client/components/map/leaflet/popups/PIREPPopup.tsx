import { Divider, Typography } from '@material-ui/core';
import { convertTimeFormat } from '../../common/AreoFunctions';

const icingIntensityTranslations = {
  TRC: 'Trace',
  'TRC-LGT': 'Trace to light',
  LGT: 'Light',
  'LGT-MOD': 'Light to moderate',
  MOD: 'Moderate',
  'MOD-SEV': 'Moderate to severe',
  SEV: 'Severe',
  HVY: 'Heavy',
  NEG: 'None',
};
const turbulenceIntensityTranslations = {
  'SMTH-LGT': 'Smooth to light',
  LGT: 'Light',
  'LGT-MOD': 'Light to moderate',
  MOD: 'Moderate',
  'MOD-SEV': 'Moderate to severe',
  SEV: 'Severe',
  'SEV-EXTM': 'Severe to extreme',
  EXTM: 'Extreme',
  NEG: 'Smooth',
};
const turblenceTypeTranslations = {
  CAT: 'Clear air',
  CHOP: 'Chop',
  LLWS: 'Low-level wind shear',
  MWAVE: 'Mountain wave',
};
const icingTypeTranslations = {
  RIME: 'Rime',
  MIXED: 'Mixed',
  CLEAR: 'Clear',
};
const cloudCoverageTranslations = {
  FEW: 'Few',
  SCT: 'Scattered',
  BKN: 'Broken',
  OVC: 'Overcast',
  OVX: 'Sky obscured',
};
const turbulenceFrequencyTranslations = {
  ISOL: 'Isolated',
  CONT: 'Continuous',
  OCNL: 'Occasional',
};

const PIREPPopup = ({ feature }) => {
  const useCelsus = true;
  const useKnote = true;

  return (
    <>
      <Typography variant="subtitle2">
        {feature.properties.aireptype === 'Urgent PIREP' ? (
          <span style={{ color: 'red' }}>{feature.properties.aireptype}</span>
        ) : (
          feature.properties.aireptype
        )}{' '}
        {feature.properties.actype === 'NMRS'
          ? 'Numerous Aircraft'
          : feature.properties.actype}
      </Typography>
      <Divider />
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Time:</b> {convertTimeFormat(feature.properties.obstime)}
      </Typography>
      {feature.properties.fltlvl && feature.properties.fltlvl !== '000' ? (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Flight level:</b> {feature.properties.fltlvl}
        </Typography>
      ) : (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Flight level: </b>
          {feature.properties.fltlvltype === 'UNKN'
            ? 'Unknown'
            : feature.properties.fltlvltype === 'DURC'
            ? 'During climb'
            : feature.properties.fltlvltype === 'DURD'
            ? 'During descent'
            : 'Unknown'}
        </Typography>
      )}
      {feature.properties.temp && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Temperature:</b>{' '}
          {useCelsus
            ? feature.properties.temp + String.fromCharCode(176) + 'C'
            : Math.round(parseFloat(feature.properties.temp) * 1.8 + 32) +
              String.fromCharCode(176) +
              'F'}
        </Typography>
      )}
      {feature.properties.wdir && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind direction:</b>{' '}
          {feature.properties.wdir + String.fromCharCode(176)}
        </Typography>
      )}
      {feature.properties.wspd && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind speed::</b>{' '}
          {useKnote
            ? feature.properties.wspd + ' knots'
            : Math.round(parseFloat(feature.properties.wspd) * 1.152) + ' mph'}
        </Typography>
      )}
      {feature.properties.wxstring && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Weather:</b> {feature.properties.wxstring}
        </Typography>
      )}
      {icingIntensityTranslations[feature.properties.icgint1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Icing intensity:</b>{' '}
          {icingIntensityTranslations[feature.properties.icgint1]}
        </Typography>
      )}
      {icingTypeTranslations[feature.properties.icgtype1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Icing type:</b>{' '}
          {icingTypeTranslations[feature.properties.icgtype1]}
        </Typography>
      )}
      {turbulenceIntensityTranslations[feature.properties.tbint1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Turbulence intensity:</b>{' '}
          {turbulenceIntensityTranslations[feature.properties.tbint1]}
        </Typography>
      )}
      {turblenceTypeTranslations[feature.properties.tbtype1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Turbulence type:</b>{' '}
          {turblenceTypeTranslations[feature.properties.tbtype1]}
        </Typography>
      )}
      {turbulenceFrequencyTranslations[feature.properties.tbfreq1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Turbulence frequency:</b>{' '}
          {turbulenceFrequencyTranslations[feature.properties.tbfreq1]}
        </Typography>
      )}
      {cloudCoverageTranslations[feature.properties.cloudcvg1] && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Cloud coverage:</b>{' '}
          {cloudCoverageTranslations[feature.properties.cloudcvg1]}
        </Typography>
      )}
      {feature.properties.cloudbas1 && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Cloud base:</b>{' '}
          {parseInt(feature.properties.cloudbas1) * 100 + ' ft MSL'}
        </Typography>
      )}
      {feature.properties.cloudtop1 && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Cloud top:</b>{' '}
          {parseInt(feature.properties.cloudtop1) * 100 + ' ft MSL'}
        </Typography>
      )}
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-line' }}>
        <b>
          {feature.properties.aireptype
            ? feature.properties.aireptype
            : 'PIREP'}
          :
        </b>{' '}
        {feature.properties.rawob}
      </Typography>
    </>
  );
};
export default PIREPPopup;
