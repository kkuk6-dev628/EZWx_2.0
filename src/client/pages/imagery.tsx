import dynamic from 'next/dynamic';

const Imagery = dynamic(() => import('../components/Imagery/Imagery'), {
  ssr: false,
});

function ImageryPage() {
  return (
    <>
      <Imagery />
    </>
  );
}

export default ImageryPage;
