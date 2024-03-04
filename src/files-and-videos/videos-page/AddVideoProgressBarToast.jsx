import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Toast, ProgressBar } from '@openedx/paragon';
import messages from './messages';

const AddVideoProgressBarToast = ({
  uploadVideoProgress,
  intl,
}) => {
  let isOpen = false;
  useEffect(() => {
    isOpen = !!uploadVideoProgress;
  }, [uploadVideoProgress]);

  return (
    <Toast
      show={isOpen}
    >
        {intl.formatMessage(messages.videoUploadProgressBarLabel)}
        <ProgressBar now={uploadVideoProgress} label="60%" variant="primary"/>
    </Toast>
  );
};

AddVideoProgressBarToast.propTypes = {
  uploadVideoProgress: PropTypes.number,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(AddVideoProgressBarToast);
