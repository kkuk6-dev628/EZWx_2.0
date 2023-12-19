import { DndProvider, MultiBackend, NodeModel, Tree, getBackendOptions } from '@minoru/react-dnd-treeview';
import { useEffect, useRef, useState } from 'react';
import { useGetSavedItemsQuery, useGetSavedOrderQuery } from '../../store/saved/savedApi';
import { SavedDragPreview } from '../saved/SavedDragPreview';
import { SavedItemData } from '../../interfaces/saved';
import SavedDashboardNode from './SavedDashboardNode';
import router, { useRouter } from 'next/router';
import { setCurrentAirport } from '../../store/airportwx/airportwx';
import { useAddRecentAirportMutation } from '../../store/airportwx/airportwxApi';
import { useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/route/routes';
import { useCreateRouteMutation } from '../../store/route/routeApi';
import { setSelectedFavoriteId } from '../../store/imagery/imagery';
import { setShowSavedView } from '../../store/header/header';

function SavedDashboard() {
  const { data: savedData } = useGetSavedItemsQuery();
  const { data: savedOrder } = useGetSavedOrderQuery();
  const [treeData, setTreeData] = useState<NodeModel<SavedItemData>[]>([]);
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [createRoute] = useCreateRouteMutation();
  const dispatch = useDispatch();
  const treeRef = useRef(null);
  const router = useRouter();

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
        dispatch(setActiveRoute(node.data.data));
        createRoute(node.data.data);
        router.push('/map');
        break;
    }
  }

  return (
    <div className="dashboard-card">
      <div className="card-title">Saved</div>
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
            dispatch(setShowSavedView());
          }}
        >
          Modify
        </button>
      </div>
    </div>
  );
}
export default SavedDashboard;
