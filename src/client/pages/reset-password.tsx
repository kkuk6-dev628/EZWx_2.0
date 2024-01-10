import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PrimaryButton } from '../components/common';
import { useExistUserQuery } from '../store/auth/authApi';

function ResetPassword() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit: SubmitHandler<{ email: string }> = (data) => {
    setEmail(data.email);
  };
  const [showEmailError, setShowEmailError] = useState(false);
  const [email, setEmail] = useState(null);
  const { data: existUser, isSuccess } = useExistUserQuery(email, { skip: email === null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      if (existUser) {
        setSuccess(true);
      } else {
        setShowEmailError(true);
      }
    }
  }, [isSuccess, existUser]);

  return (
    <div className="reset-password main">
      {success ? (
        <div className="success bahnschrift">
          Please check your email (including your spam folder) for instructions on how to reset your EZWxBrief password.
        </div>
      ) : (
        <>
          {' '}
          <div className="description">
            <h3>Do you need to reset your password?</h3>
            <h1>Not a problem. Happens to the best of us. Just use the form below to reset it!</h1>
          </div>
          <div className="form-area">
            <form onSubmit={handleSubmit(onSubmit)} className="sign__frm" action="">
              {showEmailError && (
                <div className="email-error-message">
                  Sorry, we can’t find an account in our system with this email address. Please try again or{' '}
                  <Link href="/contact-us">contact our support team</Link>.
                </div>
              )}
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    Email for sign in
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Please enter a valid email address.',
                      })}
                      id="email"
                      className="csuinp__input"
                      placeholder="Your EZWxBrief email address"
                    />
                    {errors.email && <p className="csuinp__error__msg">{errors.email.message}</p>}
                  </div>
                </div>
                <p className="csuinp__txt">We will email you instructions on how to reset your password.</p>
              </div>
              <div className="btn-submit">
                <PrimaryButton type="submit" text="Submit" isLoading={false}></PrimaryButton>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
export default ResetPassword;
