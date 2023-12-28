import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { ICON_INDENT } from '../../utils/constants';
import {
  useAddRecentImageryMutation,
  useDeleteRecentImageryMutation,
  useGetRecentImageryQuery,
  useGetWxJsonQuery,
} from '../../store/imagery/imageryApi';
import { isSameSavedItem } from '../../utils/utils';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { selectViewWidth, selectViewHeight } from '../../store/airportwx/airportwx';
import { SubtabGroupItem, SubtabItem } from '../../interfaces/imagery';
import { DraggableDlg } from '../common/DraggableDlg';
import { SecondaryButton } from '../common/Buttons';
import { useDispatch } from 'react-redux';
import { setSelectedFavoriteId } from '../../store/imagery/imagery';

function RecentImagery() {
  const { data: recentImageries } = useGetRecentImageryQuery(null, { refetchOnMountOrArgChange: true });
  const { data: savedData } = useGetSavedItemsQuery(null, { refetchOnMountOrArgChange: true });
  const [savedImageries, setSavedImageries] = useState([]);
  const [addRecentImagery] = useAddRecentImageryMutation();
  const [deleteRecentImagery] = useDeleteRecentImageryMutation();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;
  const { data: imageryData, refetch: refetchWxJson } = useGetWxJsonQuery('');
  const [showImageryMissing, setShowImageryMissing] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (recentImageries && savedData) {
      const saved = recentImageries.filter((r) =>
        savedData.find((d) => isSameSavedItem(d.data, { type: 'imagery', data: { FAVORITE_ID: r.selectedImageryId } })),
      );
      setSavedImageries(saved);
    }
  }, [savedData, recentImageries]);

  function imageryClick(imagery) {
    let exist = false;
    if (imageryData && imageryData.TAB) {
      for (let i1 = 0; i1 < imageryData.TAB.length; i1++) {
        const x1 = imageryData.TAB[i1];
        if (x1.FAVORITE_ID === imagery.selectedImageryId) {
          exist = true;
          break;
        } else if (x1.SUBTAB_GROUP) {
          const ch1 = Array.isArray(x1.SUBTAB_GROUP) ? x1.SUBTAB_GROUP : x1.SUBTAB_GROUP.SUBTAB;
          if (!Array.isArray(ch1)) {
            console.log('Invalid data structure in wx.json');
          } else {
            for (let i2 = 0; i2 < ch1.length; i2++) {
              const x2 = ch1[i2];
              if (x2.FAVORITE_ID === imagery.selectedImageryId) {
                exist = true;
                break;
              } else if ((x2 as SubtabGroupItem).SUBTAB) {
                const ch2 = (x2 as SubtabGroupItem).SUBTAB;
                if (!Array.isArray(ch2)) {
                  if ((ch2 as SubtabItem).FAVORITE_ID === imagery.selectedImageryId) {
                    exist = true;
                  }
                } else {
                  for (let i3 = 0; i3 < ch2.length; i3++) {
                    const x3 = ch2[i3];
                    if (x3.FAVORITE_ID === imagery.selectedImageryId) {
                      exist = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (exist) {
      addRecentImagery(imagery);
      dispatch(setSelectedFavoriteId(imagery.selectedImageryId));
      router.push('/imagery');
    } else {
      setShowImageryMissing(true);
      deleteRecentImagery(imagery);
    }
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
          {recentImageries && recentImageries.length ? (
            recentImageries.map((imagery, index) => {
              const isSaved = savedImageries.includes(imagery);
              return (
                <div className="card-item" key={`recent-imagery-${index}`} onClick={() => imageryClick(imagery)}>
                  {isSaved && <SvgSaveFilled />}
                  <p style={!isSaved ? { paddingInlineStart: ICON_INDENT } : null}>{imagery.selectedImageryName}</p>
                </div>
              );
            })
          ) : (
            <div className="card-item">
              <p>None</p>
            </div>
          )}
        </div>
        <div className="card-footer">
          <button className="dashboard-btn" value="Modify" onClick={() => router.push('/imagery')}>
            Imagery
          </button>
        </div>
      </div>{' '}
      {expanded && <div className="dashboard-card"></div>}
      <DraggableDlg
        open={showImageryMissing}
        onClose={() => setShowImageryMissing(false)}
        title="This imagery collection has been removed!"
        body={'This imagery collection no longer exists and will be removed from the recent imagery dashboard.'}
        footer={
          <SecondaryButton
            onClick={() => setShowImageryMissing(false)}
            text="Dismiss"
            isLoading={false}
          ></SecondaryButton>
        }
      />
    </>
  );
}
export default RecentImagery;
