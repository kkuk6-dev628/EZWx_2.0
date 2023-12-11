import { FormControl, MenuItem, Select } from '@mui/material';
import { DraggableDlg } from '../common/DraggableDlg';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { useEffect, useState } from 'react';
import {
  useDeleteSavedItemMutation,
  useGetSavedItemsQuery,
  useGetSavedOrderQuery,
  useUpdateSavedItemMutation,
  useUpdateSavedOrderMutation,
} from '../../store/saved/savedApi';
import { SecondaryButton, PrimaryButton } from '../common';
import { SavedItemData } from '../../interfaces/saved';
import { SvgSaveFilled, SvgSaveOutlined } from '../utils/SvgIcons';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { isSameJson, isSameSavedItem } from '../../utils/utils';
import { isSameRoutes } from '../map/common/AreoFunctions';

interface Props {
  title: string;
  name: string;
  open: boolean;
  onClose: () => void;
  data: SavedItemData;
}

export const SaveDialog = ({ title, name, open, onClose, data }: Props) => {
  const { data: savedData, refetch: refetchSavedItems } = useGetSavedItemsQuery();
  const { data: savedOrder } = useGetSavedOrderQuery();
  const [updateSavedOrder] = useUpdateSavedOrderMutation();
  const [updateSavedItem] = useUpdateSavedItemMutation();
  const [saveFolders, setSaveFolders] = useState<NodeModel[]>(savedData && savedData.filter((x) => x.droppable));
  const [selectedSaveFolder, setSelectedSaveFolder] = useState(1);
  const [saveName, setSaveName] = useState(name);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [existSameItem, setExistSameItem] = useState(false);
  const [existingItems, setExistingItems] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteSavedItem] = useDeleteSavedItemMutation();

  useEffect(() => {
    refetchSavedItems();
  }, []);

  useEffect(() => {
    setSaveName(name);
  }, [name]);

  useEffect(() => {
    if (savedData && savedData.length > 0) {
      setSaveFolders(savedData.filter((x) => x.droppable));
      const items = savedData.filter((x) => isSameSavedItem(x.data, data));
      setExistingItems(items);
      setExistSameItem(items.length > 0 ? true : false);
    }
  }, [savedData, data]);

  const handleSaveItem = async () => {
    const { data: d } = (await updateSavedItem({
      text: saveName,
      parent: selectedSaveFolder,
      data: data,
      droppable: false,
    })) as any;
    onClose();
    if (d && d.identifiers && d.identifiers.length > 0) {
      updateSavedOrder({ ...savedOrder, order: [{ id: d.identifiers[0].id, isOpen: false }, ...savedOrder.order] });
    }
  };

  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      setNewFolderName('');
      setErrorMessage('New folder name must not be left blank!');
      return;
    }
    const { data } = (await updateSavedItem({
      text: newFolderName,
      parent: 1,
      data: { type: 'folder', data: {} },
      droppable: true,
    })) as any;
    if (data && data.identifiers && data.identifiers.length > 0) {
      setSelectedSaveFolder(data.identifiers[0].id);
      updateSavedOrder({ ...savedOrder, order: [{ id: data.identifiers[0].id, isOpen: false }, ...savedOrder.order] });
    }
    setShowCreateFolderModal(false);
  }

  function deleteSelectedItem() {
    const sameItems = savedData.filter((x) => isSameJson(x.data, data));
    sameItems.forEach((x) => {
      deleteSavedItem(x.id as number);
    });
    setShowDeleteModal(false);
  }

  const itemName = data.type === 'imagery' ? 'imagery collection' : data.type;

  return (
    <>
      <DraggableDlg
        title={title}
        open={open}
        onClose={onClose}
        toolButtons={
          <>
            <button className="right-separator width50" onClick={() => setShowCreateFolderModal(true)}>
              <CreateNewFolderOutlinedIcon />
              <p className="btn-text">New Folder</p>
            </button>
            <button
              className="width50"
              onClick={() => {
                setShowDeleteModal(true);
              }}
            >
              <DeleteOutlineIcon />
              <p className="btn-text">Delete</p>
            </button>
          </>
        }
        body={
          <>
            <FormControl>
              <label className="label" htmlFor="">
                Name
              </label>
              <div className="icon_input">
                {existSameItem ? <SvgSaveFilled /> : <SvgSaveOutlined />}
                <input
                  aria-label="name"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="modal__box__input"
                  style={{ width: '90%' }}
                />
              </div>
            </FormControl>
            <FormControl sx={{ paddingTop: 1, paddingBottom: 1, mt: 1, border: 'none', minWidth: 270 }}>
              <label className="label" htmlFor="">
                Destination Folder
              </label>

              <Select
                value={selectedSaveFolder as any}
                onChange={(e) => setSelectedSaveFolder(e.target.value)}
                displayEmpty
              >
                {saveFolders &&
                  saveFolders.map((f, index) => {
                    return (
                      <MenuItem key={`folder-${index}`} value={f.id}>
                        {f.text}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
            {showDeleteModal && (
              <DraggableDlg
                title={existSameItem ? `Delete this saved ${itemName}?` : `No saved ${itemName} found!`}
                width={440}
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                body={
                  existSameItem
                    ? `Are you sure you want to delete this saved ${itemName} from all folders?`
                    : `This ${itemName} was not found to exist in any saved folders`
                }
                footer={
                  <>
                    <SecondaryButton
                      onClick={() => setShowDeleteModal(false)}
                      text={existSameItem ? 'Abandon' : 'Close'}
                      isLoading={false}
                    />
                    {existSameItem && (
                      <PrimaryButton text="Delete" onClick={() => deleteSelectedItem()} isLoading={false} />
                    )}
                  </>
                }
              />
            )}
          </>
        }
        footer={
          <>
            <SecondaryButton onClick={onClose} text="Cancel" isLoading={false} />
            <PrimaryButton text="Save" onClick={handleSaveItem} isLoading={false} />
          </>
        }
      />
      <DraggableDlg
        title="Add new folder"
        open={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        body={
          <>
            <FormControl className="form-control-input">
              <label className="label" htmlFor="">
                New folder name
              </label>
              <input aria-label="name" type="text" onChange={(e) => setNewFolderName(e.target.value)}></input>
            </FormControl>
            {!newFolderName && <div className="error-msg">{errorMessage}</div>}
          </>
        }
        footer={
          <>
            <SecondaryButton onClick={() => setShowCreateFolderModal(false)} text="Abandon" isLoading={false} />
            <PrimaryButton text="Add" onClick={handleCreateFolder} isLoading={false} />
          </>
        }
      />
    </>
  );
};
