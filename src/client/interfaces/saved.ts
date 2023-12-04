export type SavedItemData = {
  type: 'route' | 'imagery' | 'airport';
  data: any;
};

export type SavedOrderItem = {
  id: number | string;
  isOpen: boolean;
};
