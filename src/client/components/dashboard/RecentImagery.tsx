import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { ICON_INDENT } from '../../utils/constants';
import { useAddRecentImageryMutation, useGetRecentImageryQuery } from '../../store/imagery/imageryApi';
import { isSameSavedItem } from '../../utils/utils';
import { useRouter } from 'next/router';

function RecentImagery() {
  const { data: recentImageries } = useGetRecentImageryQuery(null);
  const { data: savedData } = useGetSavedItemsQuery();
  const [savedImageries, setSavedImageries] = useState([]);
  const [addRecentAirport] = useAddRecentImageryMutation();
  const router = useRouter();

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
    <div className="dashboard-card">
      <div className="card-title">Recent Imagery</div>
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
    </div>
  );
}
export default RecentImagery;
