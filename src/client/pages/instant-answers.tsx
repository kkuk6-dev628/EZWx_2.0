import Image from 'next/image';
import { useRouter } from 'next/router';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/auth/authSlice';

function InstantAnswers() {
  const router = useRouter();
  const { id } = useSelector(selectAuth);
  return (
    <div className="content-page">
      <Image
        className="img-content-background"
        src="/images/slider5.jpeg"
        fill
        style={{ objectFit: 'cover' }}
        alt=""
      ></Image>
      <div className="content-container">
        <h1 className="content-title">Instant Answers</h1>
        <p className="content-body">
          The EZ Departure Advisor will absolutely change the way you think about a weather briefing. You often spend an
          enormous amount of time determining the best altitude and the best route, but what about the best time to
          depart? Changing your departure time by just a few hours or flying early the next morning might make the
          difference between a flight fraught with complex weather avoidance to one that is rather boring.
        </p>
        <p className="content-body">
          Traditional weather briefings from many of the heavyweight aviation apps often makes finding that perfect time
          to depart extremely time consuming. In addition to helping you determine the best route and altitude, the
          EZDeparture Advisor provides that answer almost instantly and checks to see that it meets all of your personal
          weather minimums. What other app can do that? So do you want to stack the deck in your favor with{' '}
          <b>EZWxBrief</b>?
        </p>
        <Image className="img-ipad" src="/images/iPad-Instant-Answers.png" width={320} height={240} alt=""></Image>
        {!id && (
          <button className="btn btn--primary" onClick={() => router.push('/signup')}>
            Join Now
          </button>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}
export default InstantAnswers;
