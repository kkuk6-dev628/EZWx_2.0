import { useEffect, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '../common';
import { DraggableDlg } from '../common/DraggableDlg';
import dynamic from 'next/dynamic';
import { dataURItoBlob } from '../../utils/utils';
import { useUpdateAvatarMutation } from '../../store/auth/authApi';
const Avatar = dynamic(() => import('react-avatar-edit'), { ssr: false });

function AvatarEdit({ open, onUpdate, onClose }) {
  const [src, setSrc] = useState('');
  const [preview, setPreview] = useState(null);
  const [updateAvatar, { isSuccess: updatedAvatar }] = useUpdateAvatarMutation();

  useEffect(() => {
    if (updatedAvatar) {
      onUpdate();
    }
  }, [updatedAvatar]);

  function onCloseEditor() {
    setPreview(null);
  }

  function onCrop(prev: any) {
    setPreview(prev);
  }

  function onBeforeFileLoad(elem) {
    // if (elem.target.files[0].size > 71680) {
    //   alert('File is too big!');
    //   elem.target.value = '';
    // }
  }
  function saveAvatar(e) {
    if (preview) {
      const formData = new FormData();
      formData.append('file', dataURItoBlob(preview));
      updateAvatar(formData);
    }
  }
  return (
    <DraggableDlg
      title="Edit Avatar"
      open={open}
      onClose={onClose}
      body={
        <>
          <Avatar
            width={280}
            height={280}
            src={src}
            onClose={onCloseEditor}
            onCrop={onCrop}
            onBeforeFileLoad={onBeforeFileLoad}
          ></Avatar>
          {preview && <img src={preview} alt="Preview" />}
        </>
      }
      footer={
        <>
          <SecondaryButton text="Abandon" isLoading={false} onClick={onClose}></SecondaryButton>
          <PrimaryButton text="Save" isLoading={false} onClick={saveAvatar}></PrimaryButton>
        </>
      }
    ></DraggableDlg>
  );
}
export default AvatarEdit;
