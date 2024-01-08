import { BsInstagram } from 'react-icons/bs';
import { FaYoutubeSquare } from 'react-icons/fa';
import { GrFacebook } from 'react-icons/gr';
import Image from 'next/image';
import Link from 'next/link';

function Support() {
  return (
    <div className="support">
      <div className="descriptions">
        <div className="card-body">
          <h5 className="card-title">
            <Image src="/images/Logo.png" loading="eager" width={300} height={144} alt="logo" className="header__img" />
            <br />
            <span style={{ marginLeft: 10 }}>Version 2.0</span>
          </h5>
          <p className="card-text">
            <strong>
              <span style={{ fontSize: 18, color: 'rgb(209, 213, 216)' }}>EZWxBrief</span>
            </strong>
            <span style={{ fontSize: 18, color: 'rgb(209, 213, 216)' }}>
              &nbsp;is a supplemental resource to your preflight planning and is not a substitute for a standard weather
              briefing described in{' '}
              <a href="https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_00-45H_CHG_2.pdf">
                FAA Advisory Circular 00-45H Change 2&nbsp;
              </a>
              . Weather reports, forecasts and navigation data provided by this application are not monitored 24/7 and
              may be stale, missing, incorrect or incomplete at times and this progressive web app is provided for
              educational and entertainment purposes only. Therefore, users are encouraged to always carefully check the
              date-time stamps on every product you view. Periodically, a new and improved version of{' '}
              <strong>EZWxBrief</strong> will be released containing bug fixes and/or new features. Please refer to the
              latest{' '}
              <a href="https://www.avwxtraining.com/blog/categories/release-notes" target="_blank">
                release notes
              </a>{' '}
              to determine what has been changed since the last release.
              <br />
              <br />
              For more information on how to use this application, please refer to the latest version of the{' '}
              <a href="https://s3-static.ezwxbrief.com/PG/EZWxBrief-Pilots-Guide.pdf">EZWxBrief Pilots Guide</a> and
              don't forget to check out our <a href="/faq">Frequently Asked Questions</a> page. If you have any
              questions or feedback, please feel free to <Link href="/contact-us">Contact Us</Link>. We would love to
              hear from you! One of our awesome sales or support team members will usually respond within 24 hours. Also
              check out our social media accounts to learn more about the latest version of EZWxBrief.&nbsp;&nbsp;
            </span>
          </p>
          <Link className="read-faq" href="/home">
            <span>Learn More </span> <i className="fa fa-angle-double-right" aria-hidden="true"></i>
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
    </div>
  );
}
export default Support;
