import Image from 'next/image';
import { useRouter } from 'next/router';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/auth/authSlice';

function AmazingImagery() {
  const router = useRouter();
  const { id } = useSelector(selectAuth);
  return (
    <div className="content-page">
      <Image
        className="img-content-background"
        src="/images/slide1.jpeg"
        fill
        style={{ objectFit: 'cover' }}
        alt=""
      ></Image>
      <div className="content-container">
        <h1 className="content-title">Amazing imagery</h1>
        <p className="content-body">
          The imagery in <b>EZWxBrief</b> is by far the most complete online collection of static weather imagery
          available to pilots. You’ll have access to hundreds of images meticulously organized into dozens of loops that
          depict the evolution of adverse weather better in time and space than the most popular aviation apps. The
          spatial and temporal resolution of the weather guidance is truly outstanding. No need to fumble through dozens
          of websites when you can have it all in one place with <b>EZWxBrief</b>.
        </p>
        <p className="content-body">
          The imagery view in EZWxBrief weaves all of your familiar weather guidance covering the conterminous U.S. and
          Canada with some of the newest weather products from the National Weather Service. So are you ready to ditch
          all of those outdated bookmarks and enjoy the simplicity of <b>EZWxBrief</b>?
        </p>
        <Image className="img-ipad" src="/images/Imagery-Mac.png" width={320} height={240} alt=""></Image>
        {!id && (
          <button className="btn btn--primary" onClick={() => router.push('/signup')}>
            Join Now
          </button>
        )}
      </div>
    </div>
  );
}
export default AmazingImagery;
