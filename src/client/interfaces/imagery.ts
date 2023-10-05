export interface SubtabItem {
  SUBTABLABEL: string;
  HOURS_TO_LIVE: number;
  JSON_URL: string;
  FAVORITE_ID: string;
  LOOP?: string;
  DELAY?: number;
  IMAGE: { URL: string }[];
  TITLE?: string;
}

export interface SubtabGroupItem {
  GROUP_NAME: string;
  SUBTAB: SubtabItem[];
  IMAGE?: { URL: string }[];
}

export interface ImageryCollectionItem {
  TITLE: string;
  SUBTABLABEL: string;
  HELPTEXT: string;
  LOOP: string;
  ACCESS: string;
  DELAY: number;
  SUBTAB_GROUP?: SubtabGroupItem[] | { SUBTAB: SubtabItem[] };
  JSON_URL?: string;
  FAVORITE_ID?: string;
  IMAGE?: { URL: string }[];
}

export interface ImageryState {
  id?: number;
  userId?: number;
  selectedLvl1: number;
  selectedLvl2?: number;
  selectedLvl3?: number;
  selectedLvl4?: number;
  selectedImageryName: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
