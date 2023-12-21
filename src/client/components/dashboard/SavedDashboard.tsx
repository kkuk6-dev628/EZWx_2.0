import { DndProvider, MultiBackend, NodeModel, Tree, getBackendOptions } from '@minoru/react-dnd-treeview';
import { useEffect, useRef, useState } from 'react';
import { useGetSavedItemsQuery, useGetSavedOrderQuery } from '../../store/saved/savedApi';
import { SavedDragPreview } from '../saved/SavedDragPreview';
import { SavedItemData } from '../../interfaces/saved';
import SavedDashboardNode from './SavedDashboardNode';
import router, { useRouter } from 'next/router';
import { selectViewHeight, selectViewWidth, setCurrentAirport } from '../../store/airportwx/airportwx';
import { useAddRecentAirportMutation } from '../../store/airportwx/airportwxApi';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveRoute } from '../../store/route/routes';
import { useCreateRouteMutation } from '../../store/route/routeApi';
import { setSelectedFavoriteId } from '../../store/imagery/imagery';
import { setShowSavedView } from '../../store/header/header';
import { Dialog } from '@mui/material';
import { PaperComponent } from '../common/PaperComponent';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
const RouteEditor = dynamic(() => import('../shared/Route'), {
  ssr: false,
});

function SavedDashboard() {
  const { data: savedData } = useGetSavedItemsQuery();
  const { data: savedOrder } = useGetSavedOrderQuery();
  const [treeData, setTreeData] = useState<NodeModel<SavedItemData>[]>([]);
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const treeRef = useRef(null);
  const router = useRouter();
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;

  useEffect(() => {
    if (savedData) {
      if (savedOrder && savedOrder.order.length > 0) {
        const orderedTreeData = savedOrder.order.map((order) => savedData.find((x) => x.id === order.id));
        const missed = savedData.filter((x) => !savedOrder.order.find((o) => x.id === o.id));
        const final = orderedTreeData.concat(missed).filter((x) => x);
        setTreeData(final);
      } else {
        setTreeData(savedData);
      }
    }
  }, [savedData, savedOrder]);

  useEffect(() => {
    if (savedOrder) {
      const opened = savedOrder.order.filter((x) => x.isOpen);
      if (opened.length > 0 && treeRef?.current) {
        treeRef?.current.open(opened.map((x) => x.id));
      }
    }
  }, [savedOrder, treeRef]);

  function handleClickTreeItem(node: NodeModel<SavedItemData>) {
    switch (node.data.type) {
      case 'airport':
        dispatch(setCurrentAirport(node.data.data));
        addRecentAirport({ airportId: node.data.data.key, airport: node.data.data });
        router.push('/airportwx');
        break;
      case 'imagery':
        dispatch(setSelectedFavoriteId(node.data.data.FAVORITE_ID));
        router.push('/imagery');
        break;
      case 'route':
        setSelectedRoute(node.data.data);
        setShowRouteEditor(true);
        break;
    }
  }

  return (
    <>
      <div className={'dashboard-card' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Saved</p>
          {showExpandBtn && (
            <span className="btn-expand" onClick={() => setExpanded((expanded) => !expanded)}>
              {expanded ? (
                <Icon icon="fluent:contract-down-left-28-regular" color="var(--color-primary)" />
              ) : (
                <Icon icon="fluent:contract-up-right-28-regular" color="var(--color-primary)" />
              )}
            </span>
          )}
        </div>
        <div className="card-body">
          <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <div className="saved-dashboard-tree-root">
              <Tree
                ref={treeRef}
                tree={treeData}
                rootId={0}
                render={(nodeModel, { depth, isOpen, onToggle }) => (
                  <SavedDashboardNode
                    node={nodeModel}
                    depth={depth}
                    isOpen={isOpen}
                    numberOfChildren={treeData.filter((x) => x.parent === nodeModel.id).length}
                    onClick={handleClickTreeItem}
                    onToggle={() => {
                      onToggle();
                    }}
                  />
                )}
                onDrop={() => {
                  console.log();
                }}
                // classes={{
                //   root: styles.treeRoot,
                //   draggingSource: styles.draggingSource,
                //   dropTarget: styles.dropTarget,
                //   placeholder: styles.placeholderContainer,
                // }}
                sort={false}
                insertDroppableFirst={false}
                canDrag={() => false}
              />
            </div>
          </DndProvider>
        </div>
        <div className="card-footer">
          <button
            className="dashboard-btn"
            value="Modify"
            onClick={() => {
              dispatch(setShowSavedView(true));
            }}
          >
            Modify
          </button>
        </div>
        {showRouteEditor && (
          <Dialog
            PaperComponent={PaperComponent}
            hideBackdrop
            disableEnforceFocus
            style={{ position: 'absolute' }}
            open={showRouteEditor}
            onClose={() => setShowRouteEditor(false)}
          >
            <RouteEditor setIsShowModal={setShowRouteEditor} route={selectedRoute} />
          </Dialog>
        )}
      </div>
      {expanded && <div className="dashboard-card"></div>}
    </>
  );
}
export default SavedDashboard;
