import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Tab,
  Tabs,
  Stack,
} from '@openedx/paragon';
import { useContext } from 'react';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context';
import { ComponentMenu } from '../components';
import { canEditComponent } from '../components/ComponentEditorModal';
import { useAddComponentToCourse } from '../data/apiHooks';
import ComponentDetails from './ComponentDetails';
import ComponentManagement from './ComponentManagement';
import ComponentPreview from './ComponentPreview';
import messages from './messages';

const ComponentInfo = () => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);

  const {
    sidebarComponentUsageKey: usageKey,
    readOnly,
    openComponentEditor,
    componentPickerMode,
  } = useLibraryContext();

  const {
    mutate: addComponentToCourse,
    isSuccess: addComponentToCourseSuccess,
    isError: addComponentToCourseError,
  } = useAddComponentToCourse();

  if (addComponentToCourseSuccess) {
    console.log('Component added to course');
    // FIXME: Add function to message parent that component was added to course
  }

  if (addComponentToCourseError) {
    showToast(intl.formatMessage(messages.addComponentToCourseError));
  }

  if (!usageKey) {
    return null;
  }

  const canEdit = canEditComponent(usageKey);

  const handleAddComponentToCourse = () => {
    addComponentToCourse();
  };

  return (
    <Stack>
      {!readOnly && (
        <div className="d-flex flex-wrap">
          <Button
            {...(canEdit ? { onClick: () => openComponentEditor(usageKey) } : { disabled: true })}
            variant="outline-primary"
            className="m-1 text-nowrap flex-grow-1"
          >
            {intl.formatMessage(messages.editComponentButtonTitle)}
          </Button>
          <Button disabled variant="outline-primary" className="m-1 text-nowrap flex-grow-1">
            {intl.formatMessage(messages.publishComponentButtonTitle)}
          </Button>
          <ComponentMenu usageKey={usageKey} />
        </div>
      )}
      {componentPickerMode && (
        <Button variant="outline-primary" className="m-1 text-nowrap flex-grow-1" onClick={handleAddComponentToCourse}>
          {intl.formatMessage(messages.addComponentToCourse)}
        </Button>
      )}
      <Tabs
        variant="tabs"
        className="my-3 d-flex justify-content-around"
        defaultActiveKey="preview"
      >
        <Tab eventKey="preview" title={intl.formatMessage(messages.previewTabTitle)}>
          <ComponentPreview />
        </Tab>
        <Tab eventKey="manage" title={intl.formatMessage(messages.manageTabTitle)}>
          <ComponentManagement />
        </Tab>
        <Tab eventKey="details" title={intl.formatMessage(messages.detailsTabTitle)}>
          <ComponentDetails />
        </Tab>
      </Tabs>
    </Stack>
  );
};

export default ComponentInfo;
