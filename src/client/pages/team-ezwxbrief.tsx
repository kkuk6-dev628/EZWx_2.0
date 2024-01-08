import Image from 'next/image';
import Link from 'next/link';
import { BsInstagram } from 'react-icons/bs';
import { FaYoutubeSquare } from 'react-icons/fa';
import { GrFacebook } from 'react-icons/gr';

function TeamEzwxBrief() {
  return (
    <div className="contact-us">
      <div className="descriptions">
        <div className="card-body">
          <h5 className="card-title">
            <span>The EZWxBrief Story...</span>
          </h5>
          <p className="card-text text-muted">
            <span>
              <strong>EZWxBrief</strong> is a proud product of AvWxWorkshops Inc and is headquartered in Charlotte,
              North Carolina. It is the sole creation of CFI & former NWS research meteorologist, Dr. Scott Dennstaedt.
              He is an aviation weather expert and for more than two decades Scott has been teaching general aviation
              pilots at all experience levels how to minimize their exposure to adverse weather. His mission with{' '}
              <strong>EZWxBrief</strong> is to end VFR into IMC accidents and offer the very best online weather
              guidance to pilots at an affordable price.
            </span>
          </p>
          <Link className="read-faq" href="/home">
            <span>Learn More</span> <i className="fa fa-angle-double-right" aria-hidden="true"></i>
          </Link>
        </div>
        <div className="social-area">
          <div className="find-us">Find us on social media</div>
          <div className="social-icon-area">
            <a target="_blank" href="https://facebook.com/ezwxbrief">
              <GrFacebook />
            </a>
            <a target="_blank" href="https://instagram.com/ezwxbrief">
              <BsInstagram />
            </a>
            <a target="_blank" href="https://youtube.com/@ezwxbrief">
              <FaYoutubeSquare />
            </a>
          </div>
        </div>
      </div>
      <Image
        src="/images/RouteProfileWithIcingSeverityLandscape.png"
        loading="eager"
        width={384}
        height={288}
        alt="logo"
        className="header__img"
      />
    </div>
  );
}
export default TeamEzwxBrief;
