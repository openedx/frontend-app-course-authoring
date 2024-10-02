import { Button, Stepper } from '@openedx/paragon';
import { useEffect, useState } from 'react';

import { LibraryProvider } from '../common/context';
import LibraryAuthoringPage from '../LibraryAuthoringPage';
import SelectLibrary from './SelectLibrary';

const ComponentPicker = () => {
  const [currentStep, setCurrentStep] = useState('select-library');
  const [selectedLibrary, setSelectedLibrary] = useState('');

  useEffect(() => {
    if (selectedLibrary) {
      console.log('Selected library:', selectedLibrary);
    }
  });

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
          <Button variant="outline-primary" onClick={() => alert('Cancel')}>
            Cancel
          </Button>
          <Stepper.ActionRow.Spacer />
          <Button onClick={() => setCurrentStep('pick-components')}>Next</Button>
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey="pick-components">
          <Button variant="outline-primary" onClick={() => setCurrentStep('select-library')}>
            Previous
          </Button>
          <Stepper.ActionRow.Spacer />
          <Button onClick={() => alert('Completed')}>Close</Button>
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};

export default ComponentPicker;
