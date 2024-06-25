// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Card, Stack,
} from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import { useSearchContext } from '../search-modal/manager/SearchManager';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './components/LibraryComponents';
import messages from './messages';

/**
 * @type {React.FC<{
 *   title: string,
 *   children: React.ReactNode,
 * }>}
 */
const Section = ({ title, children }) => (
  <Card>
    <Card.Header
      title={title}
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

/**
 * @type {React.FC<{
 *   libraryId: string,
 * }>}
 */
const LibraryHome = ({ libraryId }) => {
  const {
    totalHits: componentCount,
    searchKeywords,
  } = useSearchContext();

  const collectionCount = 0;

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <Stack gap={3}>
      <Section title="Recently Modified">
        <FormattedMessage {...messages.recentComponentsTempPlaceholder} />
      </Section>
      <Section title={`Collections (${collectionCount})`}>
        <LibraryCollections />
      </Section>
      <Section title={`Components (${componentCount})`}>
        <LibraryComponents libraryId={libraryId} filter={filter} variant="preview" />
      </Section>
    </Stack>
  );
};

export default LibraryHome;
