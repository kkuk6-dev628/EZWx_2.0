import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initialUserSettingsState } from '../../store/user/UserSettings';
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from '../../store/user/userSettingsApi';
import { selectAuth } from '../../store/auth/authSlice';

export const FetchUserSettings = () => {
  const { id } = useSelector(selectAuth);
  const { data, isSuccess } = useGetUserSettingsQuery({ refetchOnMountOrArgChange: true });
  const [updateUserSettings, { isLoading: isUpdating, isSuccess: isSuccessUpdate }] = useUpdateUserSettingsMutation({
    fixedCacheKey: 'user-settings',
  });
  useEffect(() => {
    if (isSuccess && id && (!data || !data.user_id)) {
      if (!isUpdating && !isSuccessUpdate) updateUserSettings({ ...initialUserSettingsState.settings, user_id: id });
    }
  }, [data, isSuccess]);
  return <></>;
};
