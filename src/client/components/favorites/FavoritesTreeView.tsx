import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Tree, NodeModel, MultiBackend, getBackendOptions, DndProvider } from '@minoru/react-dnd-treeview';
import styles from './FavoritesTreeView.module.css';
import { FavoritesNode } from './FavoritesNode';
import { FavoritesDragPreview } from './FavoritesDragPreview';
import { theme } from './favoritesTheme';
import { Menu, Item, useContextMenu } from 'react-contexify';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleIcon from '@mui/icons-material/Title';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import 'react-contexify/dist/ReactContexify.css';
import { Placeholder } from './Placeholder';
import { useGetFavoriteItemsQuery } from '../../store/favorites/favoritesApi';
import { CustomData } from '../../interfaces/favorites';

const ROOT_MENU_ID = 'root-menu';
const FOLDER_MENU_ID = 'folder-menu';
const ITEM_MENU_ID = 'item-menu';

function FavoritesTreeView() {
  const { data: favData } = useGetFavoriteItemsQuery();
  const [treeData, setTreeData] = useState<NodeModel<CustomData>[]>();
  const handleDrop = (newTree: NodeModel<CustomData>[]) => setTreeData(newTree);
  const treeRef = useRef(null);
  const { show: showContextMenu } = useContextMenu();
  const [selectedNode, setSelectedNode] = useState<NodeModel>(null);

  useEffect(() => {
    if (favData) {
      setTreeData(favData);
    }
  }, [favData]);

  useEffect(() => {
    if (treeRef.current) {
      treeRef.current.open(1);
    }
  });

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
                    <FavoritesNode
                      node={nodeModel}
                      depth={depth}
                      isOpen={isOpen}
                      onToggle={onToggle}
                      onClick={handleClickTreeItem}
                    />
                  </div>
                )}
                dragPreviewRender={(monitorProps) => <FavoritesDragPreview monitorProps={monitorProps} />}
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

export default FavoritesTreeView;
