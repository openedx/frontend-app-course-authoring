import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowForward, Settings } from '@openedx/paragon/icons';
import { useNavigate, Link } from 'react-router-dom';

import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';
import { getStudioHomeData } from '../../studio-home/data/selectors';

const PageSettingButton = ({
  id,
  courseId,
  legacyLink,
  allowedOperations,
}) => {
  const { formatMessage } = useIntl();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const navigate = useNavigate();
  const studioHomeData = useSelector(getStudioHomeData);

  const determineLinkDestination = useMemo(() => {
    if (!legacyLink) { return null; }

    if (legacyLink.includes('textbooks')) {
      return studioHomeData?.waffleFlags?.ENABLE_NEW_TEXTBOOKS_PAGE
        ? `/course/${courseId}/${id.replace('_', '-')}`
        : legacyLink;
    }

    if (legacyLink.includes('tabs')) {
      return studioHomeData?.waffleFlags?.ENABLE_NEW_CUSTOM_PAGES
        ? `/course/${courseId}/${id.replace('_', '-')}`
        : legacyLink;
    }

    return null;
  }, [legacyLink, studioHomeData?.waffleFlags, id]);

  const canConfigureOrEnable = allowedOperations?.configure || allowedOperations?.enable;

  if (determineLinkDestination) {
    return (
      <Link to={determineLinkDestination}>
        <IconButton
          src={ArrowForward}
          iconAs={Icon}
          size="inline"
          alt={formatMessage(messages.settings)}
        />
      </Link>
    );
  }

  if (!canConfigureOrEnable) {
    return null;
  }

  return (
    <IconButton
      src={Settings}
      iconAs={Icon}
      size="inline"
      alt={formatMessage(messages.settings)}
      onClick={() => navigate(`${pagesAndResourcesPath}/${id}/settings`)}
    />
  );
};

PageSettingButton.defaultProps = {
  legacyLink: null,
  allowedOperations: null,
  courseId: null,
};

PageSettingButton.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string,
  legacyLink: PropTypes.string,
  allowedOperations: PropTypes.shape({
    configure: PropTypes.bool,
    enable: PropTypes.bool,
  }),
};

export default PageSettingButton;
