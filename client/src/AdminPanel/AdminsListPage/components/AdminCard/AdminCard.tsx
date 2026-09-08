import classNames from 'classnames';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';

import * as consts from './consts';
import type { AdminCardProps } from './models';
import * as styles from './styles';
import { useSetAdminUserActive } from './useSetAdminUserActive';

export const AdminCard = styled(({ className, admin, isSelf }: AdminCardProps) => {
  const setActive = useSetAdminUserActive(admin.id);

  return (
    <article className={className}>
      <div className="body">
        <h3 className="name" dir="auto">
          {admin.name}
        </h3>
        <p className="email">
          <bdi dir="auto">{admin.email}</bdi>
        </p>
        {admin.username && (
          <p className="username">
            <bdi dir="auto">{consts.usernameLabel(admin.username)}</bdi>
          </p>
        )}
        <span className={classNames('statusPill', { inactive: !admin.isActive })}>
          {admin.isActive ? consts.ACTIVE_LABEL : consts.INACTIVE_LABEL}
        </span>
      </div>

      <div className="actions">
        {isSelf ? (
          <p className="selfNote">{consts.CANNOT_DEACTIVATE_SELF_NOTE}</p>
        ) : (
          <button type="button" disabled={setActive.isPending} onClick={() => setActive.mutate(!admin.isActive)}>
            {setActive.isPending
              ? consts.UPDATING_STATUS_LABEL
              : admin.isActive
                ? consts.DEACTIVATE_LABEL
                : consts.ACTIVATE_LABEL}
          </button>
        )}
        {setActive.isError && <p className="error">{adminErrorMessage(setActive.error)}</p>}
      </div>
    </article>
  );
})`
  ${styles.AdminCard}
`;
