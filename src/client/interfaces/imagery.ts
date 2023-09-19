export interface SubtabItem {
  SUBTABLABEL: string;
  HOURS_TO_LIVE: number;
  JSON_URL: string;
  FAVORITE_ID: string;
  IMAGE: { URL: string }[];
}

export interface SubtabGroupItem {
  GROUP_NAME: string;
  SUBTAB: SubtabItem[];
}

export interface ImageryCollectionItem {
  TITLE: string;
  HELPTEXT: string;
  LOOP: string;
  ACCESS: string;
  DELAY: number;
  SUBTAB_GROUP?: SubtabGroupItem[] | { SUBTAB: SubtabItem[] };
  JSON_URL?: string;
  FAVORITE_ID?: string;
  IMAGE?: { URL: string }[];
}
