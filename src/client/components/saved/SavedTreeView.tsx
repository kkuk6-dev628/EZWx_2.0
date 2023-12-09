import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider, CssBaseline, FormControl } from '@mui/material';
import { Tree, NodeModel, MultiBackend, getBackendOptions, DndProvider, DropOptions } from '@minoru/react-dnd-treeview';
import styles from './SavedTreeView.module.css';
import { SavedNode } from './SavedNode';
import { SavedDragPreview } from './SavedDragPreview';
import { theme } from './savedTheme';
import { Menu, Item, useContextMenu } from 'react-contexify';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleIcon from '@mui/icons-material/Title';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import 'react-contexify/dist/ReactContexify.css';
import { Placeholder } from './Placeholder';
import {
  useDeleteSavedItemMutation,
  useGetSavedItemsQuery,
  useGetSavedOrderQuery,
  useUpdateSavedItemMutation,
  useUpdateSavedOrderMutation,
} from '../../store/saved/savedApi';
import { SavedItemData, SavedOrderItem } from '../../interfaces/saved';
import { SecondaryButton, PrimaryButton } from '../common';
import { DraggableDlg } from '../common/DraggableDlg';
import toast from 'react-hot-toast';

const ROOT_MENU_ID = 'root-menu';
const FOLDER_MENU_ID = 'folder-menu';
const ITEM_MENU_ID = 'item-menu';

function SavedTreeView() {
  const { data: savedData, isSuccess: loadedFavItems } = useGetSavedItemsQuery();
  const [updateSavedItem] = useUpdateSavedItemMutation();
  const { data: savedOrder, isSuccess: loadedFavOrder } = useGetSavedOrderQuery();
  const [updateSavedOrder] = useUpdateSavedOrderMutation();
  const [deleteSavedItem] = useDeleteSavedItemMutation();
  const [savedOrderLocal, setSavedOrderLocal] = useState<SavedOrderItem[]>();
  const [treeData, setTreeData] = useState<NodeModel<SavedItemData>[]>();
  const [selectedNode, setSelectedNode] = useState<NodeModel<SavedItemData>>(null);
  const { show: showContextMenu } = useContextMenu();
  const treeRef = useRef(null);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [showDuplicateFolderModal, setShowDuplicateFolderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (savedData) {
      if (savedOrder && savedOrder.order.length > 0) {
        setSavedOrderLocal(savedOrder.order);
        const orderedTreeData = savedOrder.order.map((order) => savedData.find((x) => x.id === order.id));
        const missed = savedData.filter((x) => !savedOrder.order.find((o) => x.id === o.id));
        setTreeData(orderedTreeData.concat(missed).filter((x) => x));
      } else {
        setTreeData(savedData);
      }
    }
  }, [savedData, savedOrder]);

  useEffect(() => {
    if (savedOrderLocal) {
      const opened = savedOrderLocal.filter((x) => x.isOpen);
      if (opened.length > 0 && treeRef?.current) {
        treeRef?.current.open(opened.map((x) => x.id));
      }
    }
  }, [savedOrderLocal, treeRef]);

  function createNewOrderData() {
    const newOrder = savedData.map((x) => {
      return { id: x.id as number, isOpen: false };
    });
    setSavedOrderLocal(newOrder);
    return newOrder;
  }

  function handleToggle(id: number | string, isOpen: boolean) {
    if (savedOrderLocal) {
      const order = savedOrderLocal.map((x) => ({ id: x.id, isOpen: x.id === id ? !isOpen : x.isOpen }));
      setSavedOrderLocal(order);
      updateSavedOrder({ ...savedOrder, order: order });
    } else {
      const newOrder = createNewOrderData();
      updateSavedOrder({ order: newOrder });
    }
  }

  function handleDrop(newTree: NodeModel<SavedItemData>[], { dragSource, dropTargetId }: DropOptions<SavedItemData>) {
    updateSavedItem({
      id: dragSource.id as number,
      parent: dropTargetId as number,
    });
    if (savedOrderLocal) {
      const updatedOrder = newTree.map((x) => {
        return { id: x.id as number, isOpen: savedOrderLocal.find((o) => o.id === x.id)?.isOpen || false };
      });
      updateSavedOrder({
        ...savedOrder,
        order: updatedOrder,
      });
    } else {
      const newOrder = createNewOrderData();
      updateSavedOrder({ order: newOrder });
    }
    setTreeData(newTree);
  }
  function handleRootMenuItemClick(e) {
    setNewName('');
    switch (e.id) {
      case 'new-folder':
        setShowCreateFolderModal(true);
        break;
      case 'refresh':
        break;
    }
  }

  function handleFolderMenuItemClick(e) {
    setNewName(selectedNode.text);
    switch (e.id) {
      case 'delete':
        setShowDeleteModal(true);
        break;
      case 'rename':
        setShowRenameFolderModal(true);
        break;
      case 'duplicate':
        setShowDuplicateFolderModal(true);
        break;
      case 'refresh':
        break;
    }
  }

  function handleItemMenuItemClick(e) {
    setNewName(selectedNode.text);
    switch (e.id) {
      case 'view':
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
      case 'rename':
        setShowRenameFolderModal(true);
        break;
      case 'duplicate':
        setShowDuplicateFolderModal(true);
        break;
      case 'refresh':
        break;
    }
  }

  function displayContextMenu(e, nodeModel) {
    setSelectedNode(nodeModel);
    setErrorMessage('');
    let menuId = ROOT_MENU_ID;
    if (nodeModel.id > 1) {
      menuId = nodeModel.droppable ? FOLDER_MENU_ID : ITEM_MENU_ID;
    }
    showContextMenu({ id: menuId, event: e, props: nodeModel });
  }

  function handleClickTreeItem(node) {
    setSelectedNode(node);
  }

  async function handleCreateFolder() {
    if (!newName.trim()) {
      setNewName('');
      setErrorMessage('New folder name must not be left blank!');
      return;
    }
    const result: any = await updateSavedItem({
      text: newName.trim(),
      parent: selectedNode.id as number,
      data: { type: 'folder', data: {} },
      droppable: true,
    });
    if (result.data) {
      const { id: newFolderId } = result.data.identifiers[0];
      if (newFolderId) {
        updateSavedOrder({
          ...savedOrder,
          order: [{ id: newFolderId, isOpen: true }, ...savedOrderLocal],
        });
        setShowCreateFolderModal(false);
        return;
      }
    }
    toast.error('There was an error to create folder!');
  }

  function handleRenameFolder() {
    if (!newName.trim()) {
      setNewName('');
      setErrorMessage(`New ${selectedNode.data.type} name must not be left blank!`);
      return;
    }
    updateSavedItem({
      id: selectedNode.id as number,
      text: newName.trim(),
    });
    setShowRenameFolderModal(false);
  }

  async function handleDuplicateFolder() {
    if (!newName.trim()) {
      setNewName('');
      setErrorMessage(`New ${selectedNode.data.type} name must not be left blank!`);
      return;
    }
    const result: any = await updateSavedItem({
      text: newName.trim(),
      parent: selectedNode.parent as number,
      data: selectedNode.data,
      droppable: selectedNode.droppable,
    });
    if (result.data) {
      const { id: newFolderId } = result.data.identifiers[0];
      if (newFolderId) {
        const children = savedData.filter((x) => x.parent === selectedNode.id);
        children.map((child) => {
          updateSavedItem({
            ...child,
            parent: newFolderId,
            id: undefined,
          });
        });
        const selectedOrder = savedOrderLocal.findIndex((x) => x.id === selectedNode.id);
        updateSavedOrder({
          ...savedOrder,
          order: [
            ...savedOrderLocal.slice(0, selectedOrder + 1),
            { id: newFolderId, isOpen: true },
            ...savedOrderLocal.slice(selectedOrder + 1),
          ],
        });
        setShowDuplicateFolderModal(false);
        return;
      }
    }
    toast.error('There was an error to duplicate folder!');
  }

  function deleteSelectedItem() {
    deleteSavedItem(selectedNode.id as number);
    setShowDeleteModal(false);
  }

  return (
    treeData && (
      <>
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
          <div className={styles.root}>
            <Tree
              ref={treeRef}
              tree={treeData}
              rootId={0}
              render={(nodeModel, { depth, isOpen, onToggle }) => (
                <div className="context-menu-target" onClick={(e) => displayContextMenu(e, nodeModel)}>
                  <SavedNode
                    node={nodeModel}
                    depth={depth}
                    isOpen={isOpen}
                    numberOfChildren={
                      nodeModel.id === 1
                        ? treeData.length - 1
                        : treeData.filter((x) => x.parent === nodeModel.id).length
                    }
                    onToggle={(id) => {
                      onToggle();
                      handleToggle(id, isOpen);
                    }}
                    onClick={handleClickTreeItem}
                  />
                </div>
              )}
              dragPreviewRender={(monitorProps) => <SavedDragPreview monitorProps={monitorProps} />}
              onDrop={handleDrop}
              classes={{
                root: styles.treeRoot,
                draggingSource: styles.draggingSource,
                dropTarget: styles.dropTarget,
                placeholder: styles.placeholderContainer,
              }}
              // initialOpen={[1]}
              sort={false}
              insertDroppableFirst={false}
              canDrop={(tree, { dragSource, dropTargetId, dropTarget }) => {
                if (dragSource.droppable) {
                  return dropTargetId === 1;
                }
                if (dragSource?.parent === dropTargetId) {
                  return true;
                }
              }}
              canDrag={(node) => node.id !== 1 && node.parent !== 0}
              dropTargetOffset={5}
              placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
            />
          </div>
        </DndProvider>
        <Menu id={ROOT_MENU_ID}>
          <Item id="new-folder" onClick={handleRootMenuItemClick}>
            <CreateNewFolderIcon />
            <span>New Folder</span>
          </Item>
          <Item id="refresh" onClick={handleRootMenuItemClick}>
            <RefreshIcon />
            <span>Refresh</span>
          </Item>
        </Menu>
        <Menu id={FOLDER_MENU_ID}>
          <Item id="rename" onClick={handleFolderMenuItemClick}>
            <TitleIcon />
            <span>Rename</span>
          </Item>
          <Item id="delete" onClick={handleFolderMenuItemClick}>
            <DeleteIcon />
            <span>Delete</span>
          </Item>
          <Item id="duplicate" onClick={handleFolderMenuItemClick}>
            <ContentCopyIcon />
            <span>Duplicate</span>
          </Item>
          <Item id="refresh" onClick={handleFolderMenuItemClick}>
            <RefreshIcon />
            <span>Refresh</span>
          </Item>
        </Menu>
        <Menu id={ITEM_MENU_ID}>
          <Item id="view" onClick={handleItemMenuItemClick}>
            <VisibilityIcon />
            <span>View</span>
          </Item>
          <Item id="rename" onClick={handleItemMenuItemClick}>
            <TitleIcon />
            <span>Rename</span>
          </Item>
          <Item id="delete" onClick={handleItemMenuItemClick}>
            <DeleteIcon />
            <span>Delete</span>
          </Item>
          <Item id="duplicate" onClick={handleItemMenuItemClick}>
            <ContentCopyIcon />
            <span>Duplicate</span>
          </Item>
          <Item id="refresh" onClick={handleItemMenuItemClick}>
            <RefreshIcon />
            <span>Refresh</span>
          </Item>
        </Menu>
        {showCreateFolderModal && (
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
                  <input aria-label="name" type="text" onChange={(e) => setNewName(e.target.value)}></input>
                </FormControl>
                {!newName && <div className="error-msg">{errorMessage}</div>}
              </>
            }
            footer={
              <>
                <SecondaryButton onClick={() => setShowCreateFolderModal(false)} text="Abandon" isLoading={false} />
                <PrimaryButton text="Add" onClick={handleCreateFolder} isLoading={false} />
              </>
            }
          />
        )}
        {showRenameFolderModal && (
          <DraggableDlg
            title={`Rename ${selectedNode.data.type || 'folder'}`}
            open={showRenameFolderModal}
            onClose={() => setShowRenameFolderModal(false)}
            body={
              <>
                <FormControl className="form-control-input">
                  <label className="label" htmlFor="">
                    New {selectedNode.data.type} name
                  </label>
                  <input
                    value={newName}
                    aria-label="name"
                    type="text"
                    onChange={(e) => setNewName(e.target.value)}
                  ></input>
                </FormControl>
                {!newName && <div className="error-msg">{errorMessage}</div>}
              </>
            }
            footer={
              <>
                <SecondaryButton onClick={() => setShowRenameFolderModal(false)} text="Abandon" isLoading={false} />
                <PrimaryButton text="Rename" onClick={handleRenameFolder} isLoading={false} />
              </>
            }
          />
        )}
        {showDuplicateFolderModal && (
          <DraggableDlg
            title={`Duplicate ${selectedNode.data.type || 'folder'}`}
            open={showDuplicateFolderModal}
            onClose={() => setShowDuplicateFolderModal(false)}
            body={
              <>
                <FormControl className="form-control-input">
                  <label className="label" htmlFor="">
                    New {selectedNode.data.type} name
                  </label>
                  <input
                    value={newName}
                    aria-label="name"
                    type="text"
                    onChange={(e) => setNewName(e.target.value)}
                  ></input>
                </FormControl>
                {!newName && <div className="error-msg">{errorMessage}</div>}
              </>
            }
            footer={
              <>
                <SecondaryButton onClick={() => setShowDuplicateFolderModal(false)} text="Abandon" isLoading={false} />
                <PrimaryButton text="Duplicate" onClick={handleDuplicateFolder} isLoading={false} />
              </>
            }
          />
        )}
        {showDeleteModal && (
          <DraggableDlg
            title={
              selectedNode.droppable
                ? 'Please confirm you want to delete this folder!'
                : 'Please confirm you want to delete this saved item!'
            }
            width={440}
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            body={
              selectedNode.droppable
                ? `Are you sure you want to permanently delete the ${selectedNode.text} folder and its contents?`
                : `Are you sure you want to permanently delete the ${selectedNode.text} saved item?`
            }
            footer={
              <>
                <SecondaryButton onClick={() => setShowDeleteModal(false)} text="No" isLoading={false} />
                <PrimaryButton text="Yes" onClick={() => deleteSelectedItem()} isLoading={false} />
              </>
            }
          />
        )}
      </>
    )
  );
}

export default SavedTreeView;
