import Image from 'next/image';
import { useRouter } from 'next/router';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/auth/authSlice';

function StunningVisualizations() {
  const router = useRouter();
  const { id } = useSelector(selectAuth);
  return (
    <div className="content-page">
      <Image
        className="img-content-background"
        src="/images/slider2.jpeg"
        fill
        style={{ objectFit: 'cover' }}
        alt=""
      ></Image>
      <div className="content-container">
        <h1 className="content-title">Stunning visualizations</h1>
        <p className="content-body">
          Limiting your exposure to adverse weather on any proposed flight is often a function of choosing the right
          altitude. Whether flying under visual or instrument flight rules, the <b>EZWxBrief</b> vertical route profile
          you will be able to quickly visualize the turbulence, icing, and wind as a function of altitude. This depicts
          a vertical cross-section of the weather along your route in a way that allows you to instantly see the
          location and height of clouds and where there’s a risk of icing, turbulence, convection and IFR conditions.
          Moreover, pilots flying VFR will be able to easily know their exposure to instrument meteorological conditions
          (IMC). So are you ready to minimize your exposure to adverse weather and enjoy the simplicity of{' '}
          <b>EZWxBrief</b>?
        </p>
        <Image
          className="img-ipad"
          src="/images/iPhone-Stunning-Visualizations.png"
          width={320}
          height={240}
          alt=""
        ></Image>
        {!id && (
          <button className="btn btn--primary" onClick={() => router.push('/signup')}>
            Join Now
          </button>
        )}
      </div>
    </div>
  );
}
export default StunningVisualizations;
