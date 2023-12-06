export type SavedItemData = {
  type: 'route' | 'imagery' | 'airport' | 'folder';
  data: any;
};

export type SavedOrderItem = {
  id: number | string;
  isOpen: boolean;
};
