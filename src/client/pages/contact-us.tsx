import { BsInstagram } from 'react-icons/bs';
import { FaYoutubeSquare } from 'react-icons/fa';
import { GrFacebook } from 'react-icons/gr';

function ContactUs() {
  return (
    <div className="contact-us">
      <div className="descriptions">
        <div className="card-body">
          <h5 className="card-title">
            <span>We'd love to hear your feedback!</span>
          </h5>
          <p className="card-text text-muted">
            <span>
              Do you need assistance with <strong>EZWxBrief</strong> or perhaps you have a suggestion or need to report
              a bug? Our awesome support staff is ready to assist. While we try to respond quickly, someone from our
              support team will usually reply to you within 24 hours. Simply fill out the form on this page and let us
              know what's on your mind. Don't forget to check out our FAQ page at the link below.
            </span>
          </p>
          <a className="read-faq" href="/faq">
            <span>Read our FAQs</span> <i className="fa fa-angle-double-right" aria-hidden="true"></i>
          </a>
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
      <div className="form-container">
        <div className="card-body">
          <div className="form-text">
            <strong>
              Please provide your contact information below so we can provide an awesome support experience. Details are
              often important, so please give us all of the gory details. Be assured that any personal information you
              provide stays private and we never share that information without your permission.
            </strong>
          </div>
          <div className="form">
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script
              type="text/javascript"
              src="https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.js"
            ></script>
            <style type="text/css" media="screen, projection">
              @import url(https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.css);
            </style>
            <iframe
              title="Feedback Form"
              className="freshwidget-embedded-form"
              id="freshwidget-embedded-form"
              src="https://ezwxbrief.freshdesk.com/widgets/feedback_widget/new?&amp;widgetType=embedded&amp;formTitle=Help+%26+Support&amp;submitTitle=Send+Feedback&amp;submitThanks=Thanks+for+your+feedback.+A+member+from+our+awesome+support+team+will+respond+shortly.++&amp;searchArea=no"
              scrolling="no"
              height="500px"
              width="100%"
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContactUs;
