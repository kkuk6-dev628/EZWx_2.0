import { Accordion, AccordionDetails, AccordionSummary, Tab, Tabs } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

const faqData = [
  {
    category: 'General Help',
    questions: [
      {
        question: 'Q. What does EZWxBrief stand for?',
        answer: (
          <>
            A. EZWxBrief stands for "Easy Weather Brief." It's your best online source for aviation weather & education.
            Enjoy the simplicity of EZWxBrief!
          </>
        ),
      },
      {
        question: 'Q. Who is AvWxWorkshops?',
        answer: (
          <>
            A. AvWxWorkshops Inc is a privately-held firm headquartered in Charlotte, North Carolina and is the sole
            owner of EZWxBrief. AvWxWorkshops is owned and operated by CFI and former NWS research meteorologist, Scott
            C. Dennstaedt.
          </>
        ),
      },
      {
        question: 'Q. Is there help on how to use EZWxBrief?',
        answer: (
          <>
            A. Check out our comprehensive EZWxBrief{' '}
            <a href="https://s3-static.ezwxbrief.com/PG/EZWxBrief-Pilots-Guide.pdf">Pilots Guide</a>. If you don’t find
            your answer there please feel free to <Link href="/contact-us">contact us</Link>.
          </>
        ),
      },
      {
        question: 'Q. Does EZWxBrief count as a formal weather briefing?',
        answer: (
          <>
            A. EZWxBrief should only be used as supplemental guidance when making decisions associated with a flight and
            does not count as a formal weather briefing.
          </>
        ),
      },
      {
        question: 'Q. I have questions about the EZWxBrief transition. Who do I contact?',
        answer: (
          <>
            A. We want you to be completely happy with your EZWxBrief experience during this transition period. Please{' '}
            <Link href="/contact-us">contact us</Link> and we will get back to you as quickly as possible to answer all
            of your questions.
          </>
        ),
      },
      {
        question: 'Q. Can I get weather advice for a proposed flight over the phone?',
        answer: (
          <>
            A. No. However, we do provide 1-on-1 training where you can book a one hour session to review the weather
            along your proposed route. This is considered aviation ground training and should NOT be considered a
            standard weather briefing. To learn more and book a session that works in your schedule, please{' '}
            <a href="https://avwxtraining.com/online-training">visit</a> our training website.
          </>
        ),
      },
    ],
  },
  {
    category: 'Membership / Renewal',
    questions: [
      {
        question: 'Q. Do you offer a trial membership?',
        answer: (
          <>
            A. Yes. You can <a href="/account/register">register</a> for a 30-day trial membership and get access to all
            of the features in this progressive web app. If you do not want to continue beyond 30 days, simply cancel
            your membership in your user profile prior to the 30-day trial period and there will be no cost to you.
          </>
        ),
      },
      {
        question: 'Q. How do I know when my annual or trial membership expires?',
        answer: (
          <>
            A. To determine when your membership expires, sign in to EZWxBrief and then visit your user profile. This
            user profile page will list the expiration date of your monthly or trial membership.
          </>
        ),
      },
      {
        question: 'Q. Can I automatically renew my membership with EZWxBrief?',
        answer: (
          <>
            A. Yes. When you register to become an EZWxBrief member, your account is set up to renew automatically each
            month. You can also go to your user profile page at any time to cancel your membership or update the credit
            card on file.
          </>
        ),
      },
    ],
  },
  {
    category: 'Payment / Pricing',
    questions: [
      {
        question: 'Q. What method of payment can I use to become an EZWxBrief member?',
        answer: (
          <>
            A. We only accept MasterCard, Visa and Discover Card at the moment. We do not accept PayPal, Venmo, paper
            checks, bank/wire transfers or American Express.
          </>
        ),
      },
      {
        question: 'Q. I am an EAA, NAFI, SAFE or PALS member, can I get any kind of a discount?',
        answer: (
          <>
            A. No. We do not offer any discounts for the monthly memberships. When you register, you will get to try out
            the EZWxBrief app for 30-days for free. You can cancel your membership at any time.
          </>
        ),
      },
      {
        question:
          "Q. I don't like using my credit card over the Internet. Can I call with a credit card number to become an EZWxBrief member?",
        answer: (
          <>A. No, we would simply use the same approach to enter your credit card as you would via our website.</>
        ),
      },
      {
        question: 'Q. Can I purchase a gift certificate to EZWxBrief?',
        answer: <>A. No. Currently we do not offer gift certificates.</>,
      },
      {
        question: 'Q. Can I get a refund for any products or services including memberships?',
        answer: (
          <>
            A. No. All sales are final. However, we want you to be a satisfied customer. If you are not happy with
            EZWxBrief, please <Link href="/contact-us">contact us</Link> to see how we can help.
          </>
        ),
      },
    ],
  },
  {
    category: 'Workshops',
    questions: [
      {
        question: 'Q. Were the online workshops removed from the EZWxBrief app?',
        answer: (
          <>
            Yes. The avwxworkshops.com domain was retired in March 2023. Many of these workshops were created over a
            decade ago and have reach their end of life. All of the educational material can be found in the EZWxBrief
            blog along with videos posted in the EZWxBrief <a href="https://youtube.com/@ezwxbrief">YouTube channel</a>.
          </>
        ),
      },
      {
        question: 'Q. Can I purchase a premium workshop and not be a member?',
        answer: <>A. No. All workshops have been remove from EZWxBrief and are no longer available for purchase.</>,
      },
      {
        question: 'Q. I had previously purchased a premium workshop. Can I still get access to this workshop online?',
        answer: (
          <>
            A. No. All workshops, including premium workshops, have reached their end of life and are no longer
            available to view.
          </>
        ),
      },
    ],
  },
  {
    category: 'Login / Username / Password',
    questions: [
      {
        question: 'Q. I have forgotten my username or password. What can I do to recover it?',
        answer: (
          <>
            A. Your username is always the email address you used when you registered as a member. To reset your
            password, simply go to the <a href="https://ezwxbrief.com/account/login">sign in screen</a> and click on the
            Forgot my password link. An email will be sent to you shortly with instructions on how to reset your
            password (please check your spam folder). If you are not sure of the email address you used when you joined
            or forgot your password, you can always reach out to our support team here. We'd be happy to help get you
            into your account.
          </>
        ),
      },
    ],
  },
  {
    category: 'Technical Issues',
    questions: [
      {
        question: 'Q. Is there a Pilots Guide available without a purple background?',
        answer: <>A. Yes. The first page of the Pilots Guide has a link to a version with a white background.</>,
      },
      {
        question: 'Q. Is EZWxBrief available to download from the Apple App Store or Google Play Store?',
        answer: (
          <>
            A. No. At this time, we do not provide a native app. However, EZWxBrief is designed to run as a progressive
            web application (PWA) on all devices and will look and feel just like any native app. Go to{' '}
            <a href="https://www.avwxtraining.com/post/eztip-no-8-ezwxbrief-as-a-progressive-web-app">this blog post</a>
            to learn more about how to install EZWxBrief as a PWA.
          </>
        ),
      },
      {
        question: 'Q. Is EZWxBrief available to plan a route outside of the conterminous United States?',
        answer: (
          <>
            A. Yes. It is available for routes in southern Canada, northern Mexico and part of the northern Caribbean.
            At this point we have no immediate plans to include Alaska in the EZWxBrief domain.
          </>
        ),
      },
      {
        question: 'Q. How do I add EZWxBrief to my home screen on an iPad, iPhone or portable Android device?',
        answer: (
          <>
            A. If you own an portable Apple device (e.g. iPad or iPhone), progressive web app (PWA) installation is
            supported by Safari only. For MacBook and iMac devices, Please note: PWA installation is supported by Google
            Chrome only at this time on the MacBook or iMac devices. Start the Safari browser on your portable device
            and enter https://ezwxbrief.com in the Safari address bar. You do not need to be signed in to your EZWxBrief
            account. For the iPad, in the upper-right corner, tap on the “Send To” button (on the iPhone, the Send To
            button is located at the bottom of the Safari browser window).Select the Add to Home Screen option from the
            Send To menu. Select Add to complete the process. Also read the EZWxBrief{' '}
            <a href="https://s3-static.ezwxbrief.com/PG/EZWxBrief-Pilots-Guide.pdf">Pilots Guide</a> for more
            information on PWA installation.
          </>
        ),
      },
    ],
  },
];
function Faq() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  const handleChangeCategory = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory(newValue);
    setSelectedQuestion(-1);
  };
  const handleChangeQuestion = (index) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setSelectedQuestion(newExpanded ? index : false);
  };
  return (
    <div className="faq">
      <div className="row">
        <h1>
          <strong>EZWxBrief</strong> Frequently Asked Questions (FAQ)
          <br />
          <small>
            If you have a question, please check out our Frequently Asked Questions before reaching out to our awesome
            EZWxBrief support team.
          </small>
        </h1>
      </div>
      <div className="row faq-contents">
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={selectedCategory}
          onChange={handleChangeCategory}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider' }}
          className="faq-categories"
        >
          {faqData.map((faqCat, index) => {
            return (
              <Tab
                label={faqCat.category}
                id={`faq-category-${index}`}
                aria-controls={`faq-category-tabpanel-${index}`}
              ></Tab>
            );
          })}
        </Tabs>
        {faqData.map((faqCat, index) => (
          <div
            role="tabpanel"
            hidden={selectedCategory !== index}
            id={`faq-category-tabpanel-${index}`}
            aria-labelledby={`faq-category-${index}`}
            className="faq-questions-panel"
          >
            {selectedCategory === index &&
              faqCat.questions.map((q, qIndex) => (
                <Accordion
                  expanded={selectedCategory === index && selectedQuestion === qIndex}
                  key={`faq-${index}-${qIndex}`}
                  onChange={handleChangeQuestion(qIndex)}
                  className="faq-qa"
                >
                  <AccordionSummary className="faq-question">
                    <h4>{q.question}</h4>
                  </AccordionSummary>
                  <AccordionDetails className="faq-answer">
                    <p>{q.answer}</p>
                  </AccordionDetails>
                </Accordion>
              ))}
          </div>
        ))}
      </div>
      <div className="row not-find">
        <h4>
          Didn't find what you were looking for?
          <br />
          <small>
            No problem, just feel free to <Link href="/contact-us">contact us</Link> via email and one of our awesome
            EZWxBrief support team members will be happy to address your specific question.
          </small>
        </h4>
      </div>
    </div>
  );
}
export default Faq;
