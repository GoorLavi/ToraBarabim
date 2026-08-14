import { Component } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import * as consts from './consts';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './models';
import * as styles from './styles';

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    console.error('unhandled error caught by the app error boundary', error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={this.props.className}>
          <p className="message">{consts.ERROR_MESSAGE}</p>
          <button type="button" className="reload" onClick={() => window.location.reload()}>
            {consts.RELOAD_LABEL}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = styled(ErrorBoundaryBase)`
  ${styles.ErrorBoundary}
`;
