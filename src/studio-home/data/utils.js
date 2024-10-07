/**
 * Retrieves the waffle flag configuration based on the provided result object.
 *
 * @param {Object} result - The result object containing waffle flags.
 * @param {Object} result.waffleFlags - The waffle flags for feature toggling.
 * @returns {Object} The configuration object with feature toggles.
 */
// eslint-disable-next-line import/prefer-default-export
export const getWaffleFlagsConfig = ({ waffleFlags = {} }) => ({
  ENABLE_NEW_SCHEDULE_AND_DETAILS_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewScheduleDetailsPage ?? false,
  ENABLE_NEW_GRADING_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewGradingPage ?? false,
  ENABLE_NEW_COURSE_TEAM_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewCourseTeamPage ?? false,
  ENABLE_NEW_GROUP_CONFIGURATIONS_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewGroupConfigurationsPage ?? false,
  ENABLE_NEW_ADVANCED_SETTINGS_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewAdvancedSettingsPage ?? false,
  ENABLE_NEW_COURSE_OUTLINE_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewCourseOutlinePage ?? false,
  ENABLE_NEW_COURSE_UPDATES_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewUpdatesPage ?? false,
  ENABLE_NEW_FILE_UPLOAD_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewFilesUploadsPage ?? false,
  ENABLE_NEW_PAGES_AND_RESOURCES_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewCustomPages ?? false,
  ENABLE_NEW_IMPORT_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewImportPage ?? false,
  ENABLE_NEW_EXPORT_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewExportPage ?? false,
  ENABLE_NEW_HOME_PAGE: waffleFlags.newStudioMfeUseNewHomePage ?? false,
  ENABLE_NEW_TEXTBOOKS_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewTextbooksPage ?? false,
  ENABLE_NEW_CUSTOM_PAGES: waffleFlags.contentstoreNewStudioMfeUseNewCustomPages ?? false,
  ENABLE_NEW_VIDEO_UPLOAD_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewVideoUploadsPage ?? false,
  ENABLE_NEW_CERTIFICATES_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewCertificatesPage ?? false,
  ENABLE_NEW_UNIT_PAGE: waffleFlags.contentstoreNewStudioMfeUseNewUnitPage ?? false,
});
