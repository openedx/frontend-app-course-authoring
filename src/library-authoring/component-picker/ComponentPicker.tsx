import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Stepper } from '@openedx/paragon';
import { useState } from 'react';

import { LibraryProvider } from '../common/context';
import LibraryAuthoringPage from '../LibraryAuthoringPage';
import SelectLibrary from './SelectLibrary';
import messages from './messages';

const ComponentPicker = () => {
  const intl = useIntl();

  const [currentStep, setCurrentStep] = useState('select-library');
  const [selectedLibrary, setSelectedLibrary] = useState('');

  return (
    <Stepper
      activeKey={currentStep}
    >
      <Stepper.Step eventKey="select-library" title="Select a library">
        <SelectLibrary setSelectLibrary={setSelectedLibrary} />
      </Stepper.Step>

      <Stepper.Step eventKey="pick-components" title="Pick some components">
        <LibraryProvider libraryId={selectedLibrary} componentPickerMode>
          <LibraryAuthoringPage />
        </LibraryProvider>
      </Stepper.Step>

      <div className="py-3">
        <Stepper.ActionRow eventKey="select-library">
          <Stepper.ActionRow.Spacer />
          <Button onClick={() => setCurrentStep('pick-components')}>
            {intl.formatMessage(messages.selectLibraryNextButton)}
          </Button>
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey="pick-components">
          <Button variant="outline-primary" onClick={() => setCurrentStep('select-library')}>
            {intl.formatMessage(messages.pickComponentPreviousButton)}
          </Button>
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};

export default ComponentPicker;
