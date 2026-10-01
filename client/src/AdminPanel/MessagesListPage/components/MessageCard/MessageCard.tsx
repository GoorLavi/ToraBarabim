import classNames from 'classnames';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import { phoneDisplay, phoneToInternational } from '~/helpers';

import { TYPE_LABELS } from '../../consts';
import { useUpdateVisitorMessage } from '../../useUpdateVisitorMessage';
import { HandlingNote } from './components/HandlingNote/HandlingNote';
import * as consts from './consts';
import type { MessageCardProps } from './models';
import * as styles from './styles';

export const MessageCard = styled(({ className, message }: MessageCardProps) => {
  const toggle = useUpdateVisitorMessage(message.id);
  const isHandled = message.status === 'handled';

  return (
    <article className={className}>
      <div className="body">
        <div className="head">
          <span className="type">{TYPE_LABELS[message.type]}</span>
          <span className={classNames('status', message.status)}>{isHandled ? consts.STATUS_HANDLED_LABEL : consts.STATUS_UNHANDLED_LABEL}</span>
        </div>

        <h3 className="name" dir="auto">
          {message.name}
        </h3>

        <div className="contact">
          <a className="phone" dir="ltr" href={`tel:+${phoneToInternational(message.phone)}`}>
            {phoneDisplay(message.phone)}
          </a>
          <span className="received">{consts.formatReceivedAt(message.createdAt)}</span>
        </div>

        <p className="message" dir="auto">
          {message.message}
        </p>

        <HandlingNote {...{ messageId: message.id, note: message.handlingNote }} />
      </div>

      <button
        type="button"
        className="toggle"
        disabled={toggle.isPending}
        aria-busy={toggle.isPending}
        onClick={() => toggle.mutate({ handled: !isHandled })}
      >
        {isHandled ? consts.UNDO_HANDLED_LABEL : consts.MARK_HANDLED_LABEL}
      </button>

      {toggle.isError && (
        <p className="toggleError" role="alert">
          {adminErrorMessage(toggle.error)}
        </p>
      )}
    </article>
  );
})`
  ${styles.MessageCard}
`;
