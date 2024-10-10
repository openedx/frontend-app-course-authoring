import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useCallback } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';

import { useLibraryContext } from '../common/context';
import CollectionDetails from './CollectionDetails';
import messages from './messages';

const CollectionInfo = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { libraryId, sidebarCollectionId: collectionId, componentPickerMode } = useLibraryContext();

  const url = `/library/${libraryId}/collection/${collectionId}/`;
  const urlMatch = useMatch(url);

  const handleOpenCollection = useCallback(() => {
    if (!componentPickerMode) {
      navigate(url);
    } else {
      // FIXME: Set state here
    }
  }, [componentPickerMode, url]);

  if (!collectionId) {
    return null;
  }

  return (
    <Stack>
      {!urlMatch && (
        <div className="d-flex flex-wrap">
          <Button
            onClick={handleOpenCollection}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
            disabled={!!urlMatch}
          >
            {intl.formatMessage(messages.openCollectionButton)}
          </Button>
        </div>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="manage"
      >
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          Manage tab placeholder
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          <CollectionDetails />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default CollectionInfo;
