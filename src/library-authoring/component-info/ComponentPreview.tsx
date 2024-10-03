import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, StandardModal, useToggle } from '@openedx/paragon';
import { OpenInFull } from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context';
import { LibraryBlock } from '../LibraryBlock';
import messages from './messages';

interface ModalComponentPreviewProps {
  isOpen: boolean;
  close: () => void;
  usageKey: string;
}

const ModalComponentPreview = ({ isOpen, close, usageKey }: ModalComponentPreviewProps) => {
  const intl = useIntl();

  return (
    <StandardModal
      title={intl.formatMessage(messages.previewModalTitle)}
      isOpen={isOpen}
      onClose={close}
      isOverflowVisible={false}
      className="component-preview-modal"
    >
      <LibraryBlock usageKey={usageKey} />
    </StandardModal>
  );
};

const ComponentPreview = () => {
  const intl = useIntl();

  const [isModalOpen, openModal, closeModal] = useToggle();

  const { currentComponentUsageKey: usageKey } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  return (
    <>
      <div className="position-relative m-2">
        <Button
          size="sm"
          variant="light"
          iconBefore={OpenInFull}
          onClick={openModal}
          className="position-absolute right-0 zindex-10 m-1"
        >
          {intl.formatMessage(messages.previewExpandButtonTitle)}
        </Button>
        <LibraryBlock usageKey={usageKey} />
      </div>
      <ModalComponentPreview isOpen={isModalOpen} close={closeModal} usageKey={usageKey} />
    </>
  );
};

export default ComponentPreview;
