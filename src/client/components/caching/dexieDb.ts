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
    });
  }
}

export const db = new EzwxBriefDexie();
