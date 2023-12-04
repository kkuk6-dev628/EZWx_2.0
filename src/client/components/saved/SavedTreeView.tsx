import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
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
  useGetSavedItemsQuery,
  useGetSavedOrderQuery,
  useUpdateSavedItemMutation,
  useUpdateSavedOrderMutation,
} from '../../store/saved/savedApi';
import { SavedItemData, SavedOrderItem } from '../../interfaces/saved';
import { opendir } from 'fs';

const ROOT_MENU_ID = 'root-menu';
const FOLDER_MENU_ID = 'folder-menu';
const ITEM_MENU_ID = 'item-menu';

function SavedTreeView() {
  const { data: savedData, isSuccess: loadedFavItems } = useGetSavedItemsQuery();
  const [updateSavedItem] = useUpdateSavedItemMutation();
  const { data: savedOrder, isSuccess: loadedFavOrder } = useGetSavedOrderQuery();
  const [updateSavedOrder] = useUpdateSavedOrderMutation();
  const [savedOrderLocal, setSavedOrderLocal] = useState<SavedOrderItem[]>();
  const [treeData, setTreeData] = useState<NodeModel<SavedItemData>[]>();
  const [selectedNode, setSelectedNode] = useState<NodeModel>(null);
  const { show: showContextMenu } = useContextMenu();
  const treeRef = useRef(null);

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

  function handleDrop(newTree: NodeModel<SavedItemData>[], { dragSource }: DropOptions<SavedItemData>) {
    updateSavedItem({
      id: dragSource.id as number,
      parent: dragSource.parent as number,
    });
    if (savedOrderLocal) {
      const updatedOrder = newTree.map((x) => {
        return { id: x.id as number, isOpen: savedOrderLocal.find((o) => o.id === x.id)?.isOpen || false };
      });
      setSavedOrderLocal(updatedOrder);
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
    console.log(e);
  }

  function handleFolderMenuItemClick(e) {
    console.log(e);
  }

  function handleItemMenuItemClick(e) {
    console.log(e);
  }

  function displayContextMenu(e, nodeModel) {
    let menuId = ROOT_MENU_ID;
    if (nodeModel.id > 1) {
      menuId = nodeModel.droppable ? FOLDER_MENU_ID : ITEM_MENU_ID;
    }
    showContextMenu({ id: menuId, event: e, props: nodeModel });
  }

  function handleClickTreeItem(node) {
    setSelectedNode(node);
  }

  return (
    treeData && (
      <>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <div className={styles.root}>
              <Tree
                ref={treeRef}
                tree={treeData}
                rootId={0}
                render={(nodeModel, { depth, isOpen, onToggle }) => (
                  <div onContextMenu={(e) => displayContextMenu(e, nodeModel)}>
                    <SavedNode
                      node={nodeModel}
                      depth={depth}
                      isOpen={isOpen}
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
                dropTargetOffset={5}
                placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
              />
            </div>
          </DndProvider>
        </ThemeProvider>
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
          <Item id="Duplicate" onClick={handleFolderMenuItemClick}>
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
          <Item id="Duplicate" onClick={handleItemMenuItemClick}>
            <ContentCopyIcon />
            <span>Duplicate</span>
          </Item>
          <Item id="refresh" onClick={handleItemMenuItemClick}>
            <RefreshIcon />
            <span>Refresh</span>
          </Item>
        </Menu>
      </>
    )
  );
}

export default SavedTreeView;
