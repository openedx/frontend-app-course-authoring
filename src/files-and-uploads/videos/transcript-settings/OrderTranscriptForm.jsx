import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { Button, SelectableBox, Stack } from '@edx/paragon';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import Cielo24Form from './Cielo24Form';
import ThreePlayMediaForm from './ThreePlayMediaForm';
import { RequestStatus } from '../../../data/constants';

const OrderTranscriptForm = ({
  setTranscriptType,
  activeTranscriptPreferences,
  transcriptType,
  transcriptCredentials,
  closeTranscriptSettings,
  handleOrderTranscripts,
  transcriptionPlans,
  errorMessages,
  transcriptStatus,
}) => {
  const [data, setData] = useState({});
  const hasTranscriptCredentials = !isEmpty(transcriptCredentials);
  const handleDiscard = () => {
    setTranscriptType(activeTranscriptPreferences);
    closeTranscriptSettings();
  };

  let form;
  switch (transcriptType) {
  case 'Cielo24':
    form = (
      <Cielo24Form
        {...{
          hasTranscriptCredentials,
          data,
          setData,
          transcriptionPlan: transcriptionPlans.Cielo24,
        }}
      />
    );
    break;
  case '3PlayMedia':
    form = (
      <ThreePlayMediaForm
        {...{
          hasTranscriptCredentials,
          data,
          setData,
          transcriptionPlan: transcriptionPlans['3PlayMedia'],
        }}
      />
    );
    break;
  default:
    break;
  }
  return (
    <>
      <ErrorAlert
        hideHeading={false}
        isError={transcriptStatus === RequestStatus.FAILED}
      >
        <ul className="p-0">
          {errorMessages.transcript.map(message => (
            <li key={`add-error-${message}`} style={{ listStyle: 'none' }}>
              {message}
            </li>
          ))}
        </ul>
      </ErrorAlert>
      <SelectableBox.Set
        columns={1}
        value={transcriptType}
        name="transcriptProviders"
        ariaLabel="provider selection"
        className="my-3"
        onChange={(e) => {
          setTranscriptType(e.target.value);
          setData({
            videoSourceLanguage: '',
          });
        }}
      >
        <SelectableBox
          value="order"
          aria-label="none radio"
          className="text-center"
        >
          None
        </SelectableBox>
        <SelectableBox
          value="Cielo24"
          aria-label="Cielo24 radio"
          className="text-center"
        >
          Cielo24
        </SelectableBox>
        <SelectableBox
          value="3PlayMedia"
          aria-label="3PlayMedia radio"
          className="text-center"
        >
          3Play Media
        </SelectableBox>
      </SelectableBox.Set>
      {form}
      <Stack gap={3} className="mt-4">
        <Button onClick={() => handleOrderTranscripts(data, transcriptType)}>Update Settings</Button>
        <Button variant="tertiary" onClick={handleDiscard}>Discard Settings</Button>
      </Stack>
    </>
  );
};

OrderTranscriptForm.propTypes = {
  setTranscriptType: PropTypes.func.isRequired,
  activeTranscriptPreferences: PropTypes.shape({}),
  transcriptType: PropTypes.string.isRequired,
  transcriptCredentials: PropTypes.isRequired,
  closeTranscriptSettings: PropTypes.func.isRequired,
  transcriptStatus: PropTypes.string.isRequired,
  errorMessages: PropTypes.shape({
    transcript: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  handleOrderTranscripts: PropTypes.func.isRequired,
  transcriptionPlans: PropTypes.shape({
    Cielo24: PropTypes.shape({
      turnaround: PropTypes.shape({}),
      fidelity: PropTypes.shape({}),
    }).isRequired,
    '3PlayMedia': PropTypes.shape({
      turnaround: PropTypes.shape({}),
      translations: PropTypes.shape({}),
      languages: PropTypes.shape({}),
    }).isRequired,
  }).isRequired,
};

OrderTranscriptForm.defaultProps = {
  activeTranscriptPreferences: null,
};

export default OrderTranscriptForm;