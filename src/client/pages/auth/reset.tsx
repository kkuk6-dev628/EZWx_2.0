import { useSearchParams } from 'next/navigation';
import { useResetMutation, useValidateTokenQuery } from '../../store/auth/authApi';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PrimaryButton } from '../../components/common';
import { validateConfirmPassword, validatePassword } from '../../utils/utils';
import { useState } from 'react';
import Link from 'next/link';

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const { data: user, isSuccess: checkingLink } = useValidateTokenQuery(searchParams.get('token'), {
    skip: !searchParams,
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<{ email: string; password: string; confirm: string }>();
  const [password, setPassword] = useState('');
  const [resetPassword, resetResult] = useResetMutation();

  const onSubmit: SubmitHandler<{ email: string; password: string; confirm: string }> = (data) => {
    data.email = user.email;
    resetPassword(data);
  };
  return (
    <div className="reset-password main">
      {!checkingLink ? (
        <>Checking Link...</>
      ) : user ? (
        <>
          {resetResult.isSuccess && resetResult.data ? (
            <div className="success bahnschrift">
              Your password has been reset. Please <Link href="/signin">click here to sign in</Link>.
            </div>
          ) : (
            <>
              {' '}
              <div className="description">
                <h3>Reset your password</h3>
              </div>
              <div className="form-area">
                <form onSubmit={handleSubmit(onSubmit)} className="sign__frm" action="">
                  <div className="csuinp">
                    <div className="csuinp__ipt__wrp">
                      <label htmlFor="email" className="csuinp__lbl">
                        Email*
                      </label>
                      <div className="csuinp__wrp__two">
                        <input type="email" id="email" className="csuinp__input" value={user.email} disabled />
                      </div>
                    </div>
                    <div className="csuinp__ipt__wrp">
                      <label htmlFor="password" className="csuinp__lbl">
                        Password*
                      </label>
                      <div className="csuinp__wrp__two">
                        <input
                          {...register('password', {
                            validate: validatePassword,
                          })}
                          type="password"
                          id="password"
                          onChange={(e) => setPassword(e.target.value)}
                          className="csuinp__input"
                          value={password}
                        />
                        {errors.password && <p className="csuinp__error__msg">{errors.password.message}</p>}
                      </div>
                    </div>
                    <div className="csuinp__ipt__wrp">
                      <label htmlFor="confirm" className="csuinp__lbl">
                        Confirm Password*
                      </label>
                      <div className="csuinp__wrp__two">
                        <input
                          {...register('confirm', {
                            required: 'Confirm password is required',
                            validate: (value) => validateConfirmPassword(value, password),
                          })}
                          type="password"
                          id="confirm"
                          className="csuinp__input"
                        />
                        {errors.confirm && <p className="csuinp__error__msg">{errors.confirm.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="btn-submit">
                    <PrimaryButton type="submit" text="Reset" isLoading={false}></PrimaryButton>
                  </div>
                </form>
              </div>
            </>
          )}
        </>
      ) : (
        <>Invalid Link</>
      )}
    </div>
  );
}
export default ResetPasswordPage;
