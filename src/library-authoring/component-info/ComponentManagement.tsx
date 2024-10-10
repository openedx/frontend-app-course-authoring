import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Stack } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import { ContentTagsDrawer } from '../../content-tags-drawer';
import { useContentTaxonomyTagsData } from '../../content-tags-drawer/data/apiHooks';

const ComponentManagement = () => {
  const intl = useIntl();
  const { sidebarComponentUsageKey: usageKey, readOnly } = useLibraryContext();

  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);
  const { data: componentTags } = useContentTaxonomyTagsData(usageKey);

  const tagsCount = React.useMemo(() => {
    if (!componentTags) {
      return 0;
    }
    let result = 0;
    componentTags.taxonomies.forEach((taxonomy) => {
      const countedTags : string[] = [];
      taxonomy.tags.forEach((tagData) => {
        tagData.lineage.forEach((tag) => {
          if (!countedTags.includes(tag)) {
            result += 1;
            countedTags.push(tag);
          }
        });
      });
    });
    return result;
  }, [componentTags]);

  // istanbul ignore if: this should never happen
  if (!componentMetadata) {
    return null;
  }

  return (
    <Stack gap={3}>
      <StatusWidget
        {...componentMetadata}
      />
      {[true, 'true'].includes(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES)
        && (
        <Collapsible
          defaultOpen
          title={(
            <Stack gap={1} direction="horizontal">
              <Icon src={Tag} />
              {intl.formatMessage(messages.manageTabTagsTitle, { count: tagsCount })}
            </Stack>
          )}
          className="border-0"
        >
          <ContentTagsDrawer
            id={usageKey}
            variant="component"
            readOnly={readOnly}
          />
        </Collapsible>
        )}
      <Collapsible
        defaultOpen
        title={(
          <Stack gap={1} direction="horizontal">
            <Icon src={Tag} />
            {intl.formatMessage(messages.manageTabCollectionsTitle)}
          </Stack>
        )}
        className="border-0"
      >
        Collections placeholder
      </Collapsible>
    </Stack>
  );
};

export default ComponentManagement;
