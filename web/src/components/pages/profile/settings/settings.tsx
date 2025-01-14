import {
  Localized,
  withLocalization,
  WithLocalizationProps,
} from '@fluent/react';
import * as React from 'react';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { COMMON_VOICE_EMAIL, UserClient } from 'common';
import { Notifications } from '../../../../stores/notifications';
import StateTree from '../../../../stores/tree';
import { User } from '../../../../stores/user';
import URLS from '../../../../urls';
import { getManageSubscriptionURL } from '../../../../utility';
import { LocaleLink } from '../../../locale-helpers';
import { InfoIcon, PenIcon, SettingsIcon } from '../../../ui/icons';
import { LabeledCheckbox, LabeledInput, LinkButton } from '../../../ui/ui';

import { useIsSubscribed } from '../../../../hooks/store-hooks';

import './settings.css';

const Section = ({
  title,
  titleAction,
  className = '',
  children,
  ...props
}: {
  title: string;
  titleAction?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) => (
  <section className={'user-setting ' + className} {...props}>
    <div className="section-title">
      <h2>{title}</h2>
      {titleAction}
    </div>
    {children && <div className="section-body">{children}</div>}
  </section>
);

interface PropsFromState {
  account: UserClient;
  locale: string;
}

interface PropsFromDispatch {
  addNotification: typeof Notifications.actions.addPill;
  saveAccount: any;
}

interface Props
  extends WithLocalizationProps,
    PropsFromState,
    PropsFromDispatch {}

function Settings(props: Props) {
  const { account, addNotification, getString } = props;
  const isSubscribed = useIsSubscribed();

  useEffect(() => {
    const { pathname, search } = location;
    if (search.includes('success=false')) {
      addNotification(
        <Localized id="email-already-used">
          <span />
        </Localized>,
        'error'
      );
      history.replaceState({}, null, pathname);
    } else if (search.includes('success=true')) {
      addNotification(
        <Localized id="profile-form-submit-saved">
          <span />
        </Localized>
      );
      history.replaceState({}, null, pathname);
    }
  }, []);

  return (
    <div>
      <Section title={getString('login-identity')} className="two-columns">
        <Localized id="email-input" attrs={{ label: true }}>
          <LabeledInput value={account.email} disabled />
        </Localized>
        <LinkButton
          outline
          className="edit-button"
          href={location.origin + '/login?change_email'}>
          <PenIcon />
          <Localized id="edit">
            <span />
          </Localized>
        </LinkButton>
        <Localized
          id="email-change-information"
          elems={{
            emailFragment: (
              <a
                href={`mailto:${COMMON_VOICE_EMAIL}`}
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}>
          <p className="email-change-info" />
        </Localized>
      </Section>

      {account.basket_token && (
        <Section
          title={getString('email-subscriptions')}
          titleAction={
            <a
              className="manage-subscriptions"
              href={getManageSubscriptionURL(account)}
              target="_blank"
              rel="noopener noreferrer">
              <Localized id="manage-subscriptions">
                <span />
              </Localized>
              <SettingsIcon />
            </a>
          }>
          <div className="email-section">
            {isSubscribed == null ? (
              <div />
            ) : (
              <LabeledCheckbox
                disabled={true}
                checked={isSubscribed}
                label={
                  <Localized id="email-opt-in-info">
                    <span />
                  </Localized>
                }
              />
            )}
            <div className="privacy-and-terms">
              <InfoIcon />
              <div>
                <Localized
                  id="email-opt-in-privacy"
                  elems={{
                    privacyLink: <LocaleLink to={URLS.PRIVACY} blank />,
                  }}>
                  <div />
                </Localized>
                <br />
                <Localized id="read-terms-q">
                  <LocaleLink to={URLS.TERMS} className="terms" blank />
                </Localized>
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

export default connect<PropsFromState, PropsFromDispatch>(
  ({ locale, user }: StateTree) => ({
    account: user.account,
    locale,
  }),
  {
    addNotification: Notifications.actions.addPill,
    saveAccount: User.actions.saveAccount,
  }
)(withLocalization(Settings));
