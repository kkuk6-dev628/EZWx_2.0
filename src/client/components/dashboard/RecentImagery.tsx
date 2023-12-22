import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { ICON_INDENT } from '../../utils/constants';
import { useAddRecentImageryMutation, useGetRecentImageryQuery } from '../../store/imagery/imageryApi';
import { isSameSavedItem } from '../../utils/utils';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { selectViewWidth, selectViewHeight } from '../../store/airportwx/airportwx';

function RecentImagery() {
  const { data: recentImageries } = useGetRecentImageryQuery(null, { refetchOnMountOrArgChange: true });
  const { data: savedData } = useGetSavedItemsQuery(null, { refetchOnMountOrArgChange: true });
  const [savedImageries, setSavedImageries] = useState([]);
  const [addRecentAirport] = useAddRecentImageryMutation();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;

  useEffect(() => {
    if (recentImageries && savedData) {
      const saved = recentImageries.filter((r) =>
        savedData.find((d) => isSameSavedItem(d.data, { type: 'imagery', data: { FAVORITE_ID: r.selectedImageryId } })),
      );
      setSavedImageries(saved);
    }
  }, [savedData, recentImageries]);

  function imageryClick(imagery) {
    addRecentAirport(imagery);
    router.push('/imagery');
  }

  return (
    <>
      <div className={'dashboard-card' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Recent Imagery</p>
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
          {recentImageries &&
            recentImageries.map((imagery, index) => {
              const isSaved = savedImageries.includes(imagery);
              return (
                <div className="card-item" key={`recent-imagery-${index}`} onClick={() => imageryClick(imagery)}>
                  {isSaved && <SvgSaveFilled />}
                  <p style={!isSaved ? { paddingInlineStart: ICON_INDENT } : null}>{imagery.selectedImageryName}</p>
                </div>
              );
            })}
        </div>
        <div className="card-footer">
          <button className="dashboard-btn" value="Modify" onClick={() => router.push('/imagery')}>
            Imagery
          </button>
        </div>
      </div>{' '}
      {expanded && <div className="dashboard-card"></div>}
    </>
  );
}
export default RecentImagery;
