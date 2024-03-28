// @ts-check
import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  CloseButton,
  Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import messages from './messages';
import ContentTagsCollapsible from './ContentTagsCollapsible';
import { extractOrgFromContentId } from './utils';
import {
  useContentTaxonomyTagsData,
  useContentData,
} from './data/apiHooks';
import { useTaxonomyList } from '../taxonomy/data/apiHooks';
import Loading from '../generic/Loading';

/** @typedef {import("../taxonomy/data/types.mjs").TaxonomyData} TaxonomyData */
/** @typedef {import("./data/types.mjs").Tag} ContentTagData */

/**
 * Drawer with the functionality to show and manage tags in a certain content.
 * It is used both in interfaces of this MFE and in edx-platform interfaces such as iframe.
 * - If you want to use it as an iframe, the component obtains the `contentId` from the url parameters.
 *   Functions to close the drawer are handled internally.
 *   TODO: We can delete this method when is no longer used on edx-platform.
 * - If you want to use it as react component, you need to pass the content id and the close functions
 *   through the component parameters.
 */
const ContentTagsDrawer = ({ id, onClose }) => {
  const intl = useIntl();
  // TODO: We can delete 'params' when the iframe is no longer used on edx-platform
  const params = useParams();
  const contentId = id ?? params.contentId;

  const org = extractOrgFromContentId(contentId);

  const [stagedContentTags, setStagedContentTags] = useState({});

  // Add a content tags to the staged tags for a taxonomy
  const addStagedContentTag = useCallback((taxonomyId, addedTag) => {
    setStagedContentTags(prevStagedContentTags => {
      const updatedStagedContentTags = {
        ...prevStagedContentTags,
        [taxonomyId]: [...(prevStagedContentTags[taxonomyId] ?? []), addedTag],
      };
      return updatedStagedContentTags;
    });
  }, [setStagedContentTags]);

  // Remove a content tag from the staged tags for a taxonomy
  const removeStagedContentTag = useCallback((taxonomyId, tagValue) => {
    setStagedContentTags(prevStagedContentTags => ({
      ...prevStagedContentTags,
      [taxonomyId]: prevStagedContentTags[taxonomyId].filter((t) => t.value !== tagValue),
    }));
  }, [setStagedContentTags]);

  // Sets the staged content tags for taxonomy to the provided list of tags
  const setStagedTags = useCallback((taxonomyId, tagsList) => {
    setStagedContentTags(prevStagedContentTags => ({ ...prevStagedContentTags, [taxonomyId]: tagsList }));
  }, [setStagedContentTags]);

  const { data: contentData, isSuccess: isContentDataLoaded } = useContentData(contentId);
  const {
    data: contentTaxonomyTagsData,
    isSuccess: isContentTaxonomyTagsLoaded,
  } = useContentTaxonomyTagsData(contentId);

  // Taxonomies by Organization
  const { data: taxonomyListData, isSuccess: isTaxonomyListLoaded } = useTaxonomyList(org, contentId);

  // All taxonomies to verify if exists object tags in other taxonomy that does not belong to the organization.
  const { data: allTaxonomyListData, isSuccess: isAllTaxonomyListLoaded } = useTaxonomyList(undefined, contentId);

  let contentName = '';
  if (isContentDataLoaded) {
    if ('displayName' in contentData) {
      contentName = contentData.displayName;
    } else {
      contentName = contentData.courseDisplayNameWithDefault;
    }
  }

  let onCloseDrawer = onClose;
  if (onCloseDrawer === undefined) {
    onCloseDrawer = () => {
      // "*" allows communication with any origin
      window.parent.postMessage('closeManageTagsDrawer', '*');
    };
  }

  useEffect(() => {
    const handleEsc = (event) => {
      /* Close drawer when ESC-key is pressed and selectable dropdown box not open */
      const selectableBoxOpen = document.querySelector('[data-selectable-box="taxonomy-tags"]');
      if (event.key === 'Escape' && !selectableBoxOpen) {
        onCloseDrawer();
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const taxonomies = useMemo(() => {
    if (taxonomyListData && contentTaxonomyTagsData && allTaxonomyListData) {
      // Initialize list of content tags in taxonomies to populate
      const taxonomiesList = taxonomyListData.results.map((taxonomy) => ({
        ...taxonomy,
        contentTags: /** @type {ContentTagData[]} */([]),
      }));
      const allTaxonomiesList = allTaxonomyListData.results.map((taxonomy) => ({
        ...taxonomy,
        contentTags: /** @type {ContentTagData[]} */([]),
      }));

      const contentTaxonomies = contentTaxonomyTagsData.taxonomies;

      // eslint-disable-next-line array-callback-return
      contentTaxonomies.map((contentTaxonomyTags) => {
        const contentTaxonomy = taxonomiesList.find((taxonomy) => taxonomy.id === contentTaxonomyTags.taxonomyId);
        if (contentTaxonomy) {
          contentTaxonomy.contentTags = contentTaxonomyTags.tags;
        }
        else {
          // In some cases, there are object tags in taxonomies that are not part of the course organization
          // It is necessary to show these tags, but without being able to add or delete tags (managed by permissions)
          const contentTaxonomy = allTaxonomiesList.find((taxonomy) => taxonomy.id === contentTaxonomyTags.taxonomyId);;
          if (contentTaxonomy) {
            contentTaxonomy.contentTags = contentTaxonomyTags.tags;
            taxonomiesList.push(contentTaxonomy)
          }
        }
      });

      return taxonomiesList;
    }
    return [];
  }, [
    taxonomyListData,
    contentTaxonomyTagsData,
    allTaxonomyListData,
  ]);

  return (

    <div className="mt-1">
      <Container size="xl">
        <CloseButton onClick={() => onCloseDrawer()} data-testid="drawer-close-button" />
        <span>{intl.formatMessage(messages.headerSubtitle)}</span>
        { isContentDataLoaded
          ? <h3>{ contentName }</h3>
          : (
            <div className="d-flex justify-content-center align-items-center flex-column">
              <Spinner
                animation="border"
                size="xl"
                screenReaderText={intl.formatMessage(messages.loadingMessage)}
              />
            </div>
          )}

        <hr />

        { isTaxonomyListLoaded && isAllTaxonomyListLoaded && isContentTaxonomyTagsLoaded
          ? taxonomies.map((data) => (
            <div key={`taxonomy-tags-collapsible-${data.id}`}>
              <ContentTagsCollapsible
                contentId={contentId}
                taxonomyAndTagsData={data}
                stagedContentTags={stagedContentTags[data.id] || []}
                addStagedContentTag={addStagedContentTag}
                removeStagedContentTag={removeStagedContentTag}
                setStagedTags={setStagedTags}
              />
              <hr />
            </div>
          ))
          : <Loading />}

      </Container>
    </div>
  );
};

ContentTagsDrawer.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
};

ContentTagsDrawer.defaultProps = {
  id: undefined,
  onClose: undefined,
};

export default ContentTagsDrawer;
