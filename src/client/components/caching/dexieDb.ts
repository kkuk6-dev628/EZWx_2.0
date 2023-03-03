import Dexie, { Table } from 'dexie';

export class EzwxBriefDexie extends Dexie {
  // We just tell the typing system this is the case
  metars!: Table<GeoJSON.Feature>;
  pireps!: Table<GeoJSON.Feature>;
  convectiveOutlook!: Table<GeoJSON.Feature>;
  cwa!: Table<GeoJSON.Feature>;
  gairmet!: Table<GeoJSON.Feature>;
  intlSigmet!: Table<GeoJSON.Feature>;
  sigmet!: Table<GeoJSON.Feature>;
  usProvinces!: Table<GeoJSON.Feature>;
  canadianProvinces!: Table<GeoJSON.Feature>;
  countyWarningAreas!: Table<GeoJSON.Feature>;
  nbmStations!: Table<GeoJSON.Feature>;

  constructor() {
    super('EzwxBriefDexie');
    this.version(2).stores({
      metars: 'id',
      pireps: 'id',
      convectiveOutlook: 'id',
      cwa: 'id',
      gairmet: 'id',
      intlSigmet: 'id',
      sigmet: 'id',
      usProvinces: 'id',
      canadianProvinces: 'id',
      countyWarningAreas: 'id',
      airports: '++id',
      waypoints: '++id',
      station_1: '++id',
      station_2: '++id',
      station_3: '++id',
      station_4: '++id',
      station_5: '++id',
      station_6: '++id',
      station_7: '++id',
      station_8: '++id',
      station_9: '++id',
      station_10: '++id',
      station_11: '++id',
      station_12: '++id',
      station_13: '++id',
      station_14: '++id',
      station_15: '++id',
      station_16: '++id',
      station_17: '++id',
      station_18: '++id',
      station_19: '++id',
      station_20: '++id',
      station_21: '++id',
      station_22: '++id',
      station_23: '++id',
      station_24: '++id',
      station_25: '++id',
      station_26: '++id',
      station_27: '++id',
      station_28: '++id',
      station_29: '++id',
      station_30: '++id',
      station_31: '++id',
      station_32: '++id',
      station_33: '++id',
      station_34: '++id',
      station_35: '++id',
      station_36: '++id',
      station_37: '++id',
      station_38: '++id',
      station_39: '++id',
      station_40: '++id',
      station_41: '++id',
      station_42: '++id',
      station_43: '++id',
      station_44: '++id',
      station_45: '++id',
      station_46: '++id',
      station_47: '++id',
      station_48: '++id',
      station_49: '++id',
      station_50: '++id',
      station_51: '++id',
      station_52: '++id',
      station_53: '++id',
      station_54: '++id',
      station_55: '++id',
      station_56: '++id',
      station_57: '++id',
      station_58: '++id',
      station_59: '++id',
      station_60: '++id',
      station_61: '++id',
      station_62: '++id',
      station_63: '++id',
      station_64: '++id',
      station_65: '++id',
      station_66: '++id',
      station_67: '++id',
      station_68: '++id',
      station_69: '++id',
      station_70: '++id',
      station_71: '++id',
      station_72: '++id',
    });
  }
}

export const db = new EzwxBriefDexie();
