import { Button, FormControl, MenuItem, Select } from '@mui/material';
import { DraggableDlg } from '../common/DraggableDlg';
import { AiOutlineHeart } from 'react-icons/ai';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery, useUpdateSavedItemMutation } from '../../store/saved/savedApi';
import { BsFolderPlus } from 'react-icons/bs';
import { SecondaryButton, PrimaryButton } from '../common';
import { SavedItemData } from '../../interfaces/saved';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  data: SavedItemData;
}

export const SaveDialog = ({ title, open, onClose, data }: Props) => {
  const { data: savedData } = useGetSavedItemsQuery();
  const [updateSavedItem] = useUpdateSavedItemMutation();
  const [saveFolders, setSaveFolders] = useState<NodeModel[]>(savedData && savedData.filter((x) => x.droppable));
  const [selectedSaveFolder, setSelectedSaveFolder] = useState(1);
  const [saveName, setSaveName] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (savedData && savedData.length > 0) {
      setSaveFolders(savedData.filter((x) => x.droppable));
    }
  }, [savedData]);

  const handleSaveItem = () => {
    updateSavedItem({
      text: saveName,
      parent: selectedSaveFolder,
      data: data,
      droppable: false,
    });
    onClose();
  };

  function handleCreateFolder() {
    updateSavedItem({
      text: newFolderName,
      parent: 1,
      data: { type: 'folder', data: {} },
      droppable: true,
    });
    setShowCreateFolderModal(false);
  }

  return (
    <>
      <DraggableDlg
        title={title}
        open={open}
        onClose={onClose}
        body={
          <>
            <FormControl>
              <label className="label" htmlFor="">
                Name
              </label>
              <div className="route__modal__box__input1">
                <AiOutlineHeart className="route__modal__box__icon" />
                <input
                  aria-label="name"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="route__modal__box__input"
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
                  saveFolders.map((f) => {
                    return (
                      <MenuItem key={'folder-' + f.text} value={f.id}>
                        {f.text}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
            <div className="button">
              <BsFolderPlus />
              <Button variant="text" onClick={() => setShowCreateFolderModal(true)}>
                Add New Folder
              </Button>
            </div>
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
          <FormControl className="form-control-input">
            <label className="label" htmlFor="">
              New folder name
            </label>
            <input aria-label="name" type="text" onChange={(e) => setNewFolderName(e.target.value)}></input>
          </FormControl>
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
