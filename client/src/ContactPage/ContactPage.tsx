import styled from 'styled-components';

import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { Footer } from '~/HomePage/components/Footer/Footer';

import { AddressCard } from './components/AddressCard/AddressCard';
import { TipCard } from './components/TipCard/TipCard';
import * as consts from './consts';
import type { ContactPageProps } from './models';
import * as styles from './styles';

// No network call on this page (06-contact.md, "Data"): no loading, empty
// or error state to design here.
export const ContactPage = styled(({ className }: ContactPageProps) => (
  <div className={className}>
    <LessonPageHeader />

    <main className="content">
      <div className="column">
        <h1 className="title">{consts.TITLE}</h1>
        <p className="lead">{consts.LEAD}</p>

        <section className="whenToWrite">
          <h2 className="heading">{consts.WHEN_TO_WRITE_HEADING}</h2>
          <ul className="bullets">
            {consts.WHEN_TO_WRITE_BULLETS.map((bullet) => (
              <li className="bullet" key={bullet}>
                <span className="dot" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        <AddressCard />
        <TipCard />

        <p className="limit">{consts.LIMIT_NOTE}</p>
      </div>
    </main>

    <div className="footer">
      <Footer />
    </div>
  </div>
))`
  ${styles.ContactPage}
`;
