// @ts-check
import React, { useEffect, useState, useCallback } from 'react';
import {
  Icon,
  Spinner,
  Button,
} from '@openedx/paragon';
import { SelectableBox } from '@edx/frontend-lib-content-components';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { ArrowDropDown, ArrowDropUp, Add } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import messages from './messages';

import { useTaxonomyTagsData } from './data/apiHooks';

const HighlightedText = ({ text, highlight }) => {
  if (!highlight) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) => (
        // eslint-disable-next-line react/no-array-index-key -- using index because part is not unique
        <React.Fragment key={index}>
          {part.toLowerCase() === highlight.toLowerCase() ? <b>{part}</b> : part}
        </React.Fragment>
      ))}
    </span>
  );
};

HighlightedText.propTypes = {
  text: PropTypes.string.isRequired,
  highlight: PropTypes.string,
};

HighlightedText.defaultProps = {
  highlight: '',
};

const ContentTagsDropDownSelector = ({
  taxonomyId, level, lineage, appliedContentTagsTree, stagedContentTagsTree, searchTerm,
}) => {
  const intl = useIntl();

  // This object represents the states of the dropdowns on this level
  // The keys represent the index of the dropdown with
  // the value true (open) false (closed)
  const [dropdownStates, setDropdownStates] = useState(/** type Record<string, boolean> */ {});
  const isOpen = (tagValue) => dropdownStates[tagValue];

  const [numPages, setNumPages] = useState(1);
  const parentTagValue = lineage.length ? decodeURIComponent(lineage[lineage.length - 1]) : null;
  const { hasMorePages, tagPages } = useTaxonomyTagsData(taxonomyId, parentTagValue, numPages, searchTerm);

  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);

  // Reset the page and tags state when search term changes
  // and store search term to compare
  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setNumPages(1);
  }

  useEffect(() => {
    if (tagPages.isSuccess) {
      if (searchTerm) {
        const expandAll = tagPages.data.reduce(
          (acc, tagData) => ({
            ...acc,
            [tagData.value]: !!tagData.childCount,
          }),
          {},
        );
        setDropdownStates(expandAll);
      } else {
        setDropdownStates({});
      }
    }
  }, [searchTerm, tagPages.isSuccess]);

  const clickAndEnterHandler = (tagValue) => {
    // This flips the state of the dropdown at index false (closed) -> true (open)
    // and vice versa. Initially they are undefined which is falsy.
    setDropdownStates({ ...dropdownStates, [tagValue]: !dropdownStates[tagValue] });
  };

  const isImplicit = (tag) => {
    // Traverse the applied tags tree using the lineage
    let appliedTraversal = appliedContentTagsTree;
    lineage.forEach(t => {
      appliedTraversal = appliedTraversal[t]?.children || {};
    });
    const isAppliedImplicit = (appliedTraversal[tag.value] && !appliedTraversal[tag.value].explicit);

    // Traverse the staged tags tree using the lineage
    let stagedTraversal = stagedContentTagsTree;
    lineage.forEach(t => {
      stagedTraversal = stagedTraversal[t]?.children || {};
    });
    const isStagedImplicit = (stagedTraversal[tag.value] && !stagedTraversal[tag.value].explicit);

    return isAppliedImplicit || isStagedImplicit || false;
  };

  const isApplied = (tag) => {
    // Traverse the applied tags tree using the lineage
    let appliedTraversal = appliedContentTagsTree;
    lineage.forEach(t => {
      appliedTraversal = appliedTraversal[t]?.children || {};
    });
    return !!appliedTraversal[tag.value];
  };

  const loadMoreTags = useCallback(() => {
    setNumPages((x) => x + 1);
  }, []);

  return (
    <div style={{ marginLeft: `${level * 1 }rem` }}>
      {tagPages.isLoading ? (
        <div className="d-flex justify-content-center align-items-center flex-row">
          <Spinner
            animation="border"
            size="xl"
            screenReaderText={intl.formatMessage(messages.loadingTagsDropdownMessage)}
          />
        </div>
      ) : null }
      {tagPages.isError ? 'Error...' : null /* TODO: show a proper error message */}

      {tagPages.data?.map((tagData) => (
        <React.Fragment key={tagData.value}>
          <div
            className="d-flex flex-row"
            style={{
              minHeight: '44px',
            }}
          >
            <div className="d-flex">
              <SelectableBox
                inputHidden={false}
                type="checkbox"
                className="d-flex align-items-center taxonomy-tags-selectable-box"
                aria-label={intl.formatMessage(messages.taxonomyTagsCheckboxAriaLabel, { tag: tagData.value })}
                data-selectable-box="taxonomy-tags"
                value={[...lineage, tagData.value].map(t => encodeURIComponent(t)).join(',')}
                isIndeterminate={isImplicit(tagData)}
                disabled={isApplied(tagData) || isImplicit(tagData)}
              >
                <HighlightedText text={tagData.value} highlight={searchTerm} />
              </SelectableBox>
              { tagData.childCount > 0
                && (
                  <div className="d-flex align-items-center taxonomy-tags-arrow-drop-down">
                    <Icon
                      src={isOpen(tagData.value) ? ArrowDropUp : ArrowDropDown}
                      onClick={() => clickAndEnterHandler(tagData.value)}
                      tabIndex="0"
                      onKeyPress={(event) => (event.key === 'Enter' ? clickAndEnterHandler(tagData.value) : null)}
                    />
                  </div>
                )}
            </div>

          </div>

          { tagData.childCount > 0 && isOpen(tagData.value) && (
            <ContentTagsDropDownSelector
              taxonomyId={taxonomyId}
              level={level + 1}
              lineage={[...lineage, tagData.value]}
              appliedContentTagsTree={appliedContentTagsTree}
              stagedContentTagsTree={stagedContentTagsTree}
              searchTerm={searchTerm}
            />
          )}

        </React.Fragment>
      ))}

      { hasMorePages
        ? (
          <div>
            <Button
              variant="tertiary"
              iconBefore={Add}
              onClick={loadMoreTags}
              className="mb-2 taxonomy-tags-load-more-button px-0 text-info-500"
            >
              <FormattedMessage {...messages.loadMoreTagsButtonText} />
            </Button>
          </div>
        )
        : null}

      { tagPages.data.length === 0 && !tagPages.isLoading && (
        <div className="d-flex justify-content-center muted-text">
          <FormattedMessage {...messages.noTagsFoundMessage} values={{ searchTerm }} />
        </div>
      )}

    </div>
  );
};

ContentTagsDropDownSelector.defaultProps = {
  lineage: [],
  searchTerm: '',
};

ContentTagsDropDownSelector.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  lineage: PropTypes.arrayOf(PropTypes.string),
  appliedContentTagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
    }).isRequired,
  ).isRequired,
  stagedContentTagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
    }).isRequired,
  ).isRequired,
  searchTerm: PropTypes.string,
};

export default ContentTagsDropDownSelector;
