import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getPagePath } from '../utils';
import { getStudioHomeData } from '../studio-home/data/selectors';
import messages from './messages';

export const useContentMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const { waffleFlags } = useSelector(getStudioHomeData);

  const items = [
    {
      href: waffleFlags?.ENABLE_NEW_COURSE_OUTLINE_PAGE ? `/course/${courseId}` : `${studioBaseUrl}/course/${courseId}`,
      title: intl.formatMessage(messages['header.links.outline']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_COURSE_UPDATES_PAGE ? `/course/${courseId}/course_info` : `${studioBaseUrl}/course_info/${courseId}`,
      title: intl.formatMessage(messages['header.links.updates']),
    },
    {
      href: getPagePath(courseId, 'true', 'tabs'),
      title: intl.formatMessage(messages['header.links.pages']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_FILE_UPLOAD_PAGE ? `/course/${courseId}/assets` : `${studioBaseUrl}/assets/${courseId}`,
      title: intl.formatMessage(messages['header.links.filesAndUploads']),
    },
  ];
  if (getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' || waffleFlags?.ENABLE_NEW_VIDEO_UPLOAD_PAGE) {
    items.push({
      href: `/course/${courseId}/videos`,
      title: intl.formatMessage(messages['header.links.videoUploads']),
    });
  }

  return items;
};

export const useSettingMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const { canAccessAdvancedSettings, waffleFlags } = useSelector(getStudioHomeData);

  const items = [
    {
      href: waffleFlags?.ENABLE_NEW_SCHEDULE_AND_DETAILS_PAGE ? `/course/${courseId}/settings/details` : `${studioBaseUrl}/settings/details/${courseId}`,
      title: intl.formatMessage(messages['header.links.scheduleAndDetails']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_GRADING_PAGE ? `/course/${courseId}/settings/grading` : `${studioBaseUrl}/settings/grading/${courseId}`,
      title: intl.formatMessage(messages['header.links.grading']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_COURSE_TEAM_PAGE ? `/course/${courseId}/course_team` : `${studioBaseUrl}/course_team/${courseId}`,
      title: intl.formatMessage(messages['header.links.courseTeam']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_GROUP_CONFIGURATIONS_PAGE ? `/course/${courseId}/group_configurations` : `${studioBaseUrl}/group_configurations/${courseId}`,
      title: intl.formatMessage(messages['header.links.groupConfigurations']),
    },
    ...(canAccessAdvancedSettings === true
      ? [{
        href: waffleFlags?.ENABLE_NEW_ADVANCED_SETTINGS_PAGE ? `/course/${courseId}/settings/advanced` : `${studioBaseUrl}/settings/advanced/${courseId}`,
        title: intl.formatMessage(messages['header.links.advancedSettings']),
      }] : []
    ),
  ];
  if (getConfig().ENABLE_CERTIFICATE_PAGE === 'true' || waffleFlags?.ENABLE_NEW_CERTIFICATES_PAGE) {
    items.push({
      href: `/course/${courseId}/certificates`,
      title: intl.formatMessage(messages['header.links.certificates']),
    });
  }
  return items;
};

export const useToolsMenuItems = courseId => {
  const intl = useIntl();
  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const { waffleFlags } = useSelector(getStudioHomeData);

  const items = [
    {
      href: waffleFlags?.ENABLE_NEW_IMPORT_PAGE ? `/course/${courseId}/import` : `${studioBaseUrl}/import/${courseId}`,
      title: intl.formatMessage(messages['header.links.import']),
    },
    {
      href: waffleFlags?.ENABLE_NEW_EXPORT_PAGE ? `/course/${courseId}/export` : `${studioBaseUrl}/export/${courseId}`,
      title: intl.formatMessage(messages['header.links.exportCourse']),
    },
    ...(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true'
      ? [{
        href: '#export-tags',
        title: intl.formatMessage(messages['header.links.exportTags']),
      }] : []
    ),
    {
      href: `/course/${courseId}/checklists`,
      title: intl.formatMessage(messages['header.links.checklists']),
    },
  ];
  return items;
};
