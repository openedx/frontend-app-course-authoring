// @ts-check
import { camelCaseObject, snakeCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getStudioHomeApiUrl = () => new URL('api/contentstore/v1/home', getApiBaseUrl()).href;
export const getRequestCourseCreatorUrl = () => new URL('request_course_creator', getApiBaseUrl()).href;
export const getCourseNotificationUrl = (url) => new URL(url, getApiBaseUrl()).href;

/**
 * Get's studio home data.
 * @returns {Promise<Object>}
 */
export async function getStudioHomeData() {
  const { data } = await getAuthenticatedHttpClient().get(getStudioHomeApiUrl());

  const result = camelCaseObject(data);

  const waffleFlagsConfig = {
    ENABLE_NEW_SCHEDULE_AND_DETAILS_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewScheduleDetailsPage,
    ENABLE_NEW_GRADING_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewGradingPage,
    ENABLE_NEW_COURSE_TEAM_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewCourseTeamPage,
    ENABLE_NEW_GROUP_CONFIGURATIONS_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewGroupConfigurationsPage,
    ENABLE_NEW_ADVANCED_SETTINGS_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewAdvancedSettingsPage,
    ENABLE_NEW_COURSE_OUTLINE_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewCourseOutlinePage,
    ENABLE_NEW_COURSE_UPDATES_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewUpdatesPage,
    ENABLE_NEW_FILE_UPLOAD_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewFilesUploadsPage,
    ENABLE_NEW_PAGES_AND_RESOURCES_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewCustomPages,
    ENABLE_NEW_IMPORT_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewImportPage,
    ENABLE_NEW_EXPORT_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewExportPage,
    ENABLE_NEW_HOME_PAGE: result?.waffleFlags?.newStudioMfeUseNewHomePage,
    ENABLE_NEW_TEXTBOOKS_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewTextbooksPage,
    ENABLE_NEW_CUSTOM_PAGES: result?.waffleFlags?.contentstoreNewStudioMfeUseNewCustomPages,
    ENABLE_NEW_VIDEO_UPLOAD_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewVideoUploadsPage,
    ENABLE_NEW_CERTIFICATES_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewCertificatesPage,
    ENABLE_NEW_UNIT_PAGE: result?.waffleFlags?.contentstoreNewStudioMfeUseNewUnitPage,
  };

  result.waffleFlags = waffleFlagsConfig;

  return result;
}

/** Get list of courses from the deprecated non-paginated API */
export async function getStudioHomeCourses(search) {
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v1/home/courses${search}`);
  return camelCaseObject(data);
}
/**
 * Get's studio home courses.
 * @param {string} search - Query string parameters for filtering the courses.
 * @param {object} customParams - Additional custom parameters for the API request.
 * @returns {Promise<Object>} - A Promise that resolves to the response data containing the studio home courses.
 * Note: We are changing /api/contentstore/v1 to /api/contentstore/v2 due to upcoming breaking changes.
 * Features such as pagination, filtering, and ordering are better handled in the new version.
 * Please refer to this PR for further details: https://github.com/openedx/edx-platform/pull/34173
 */
export async function getStudioHomeCoursesV2(search, customParams) {
  const customParamsFormat = snakeCaseObject(customParams);
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v2/home/courses${search}`, { params: customParamsFormat });
  return camelCaseObject(data);
}

export async function getStudioHomeLibraries() {
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v1/home/libraries`);
  return camelCaseObject(data);
}

/**
 * Handle course notification requests.
 * @param {string} url
 * @returns {Promise<Object>}
*/
export async function handleCourseNotification(url) {
  const { data } = await getAuthenticatedHttpClient().delete(getCourseNotificationUrl(url));
  return camelCaseObject(data);
}

/**
 * Send user request to course creation access for studio home data.
 * @returns {Promise<Object>}
 */
export async function sendRequestForCourseCreator() {
  const { data } = await getAuthenticatedHttpClient().post(getRequestCourseCreatorUrl());
  return camelCaseObject(data);
}
