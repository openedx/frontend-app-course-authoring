import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import Loading from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import Header from '../header';
import NotFoundAlert from '../generic/NotFoundAlert';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
} from '../search-manager';
import LibraryComponents from './components/LibraryComponents';
import LibraryCollections from './collections/LibraryCollections';
import LibraryHome from './LibraryHome';
import { LibrarySidebar } from './library-sidebar';
import { SidebarBodyComponentId, useLibraryContext } from './common/context';
import messages from './messages';

enum TabList {
  home = '',
  components = 'components',
  collections = 'collections',
}

interface HeaderActionsProps {
  canEditLibrary: boolean;
}

const HeaderActions = ({ canEditLibrary }: HeaderActionsProps) => {
  const intl = useIntl();
  const {
    componentPickerMode,
    openAddContentSidebar,
    openInfoSidebar,
    closeLibrarySidebar,
    sidebarBodyComponent,
  } = useLibraryContext();

  if (!canEditLibrary) {
    return null;
  }

  const infoSidebarIsOpen = () => (
    sidebarBodyComponent === SidebarBodyComponentId.Info
  );

  const handleOnClickInfoSidebar = () => {
    if (infoSidebarIsOpen()) {
      closeLibrarySidebar();
    } else {
      openInfoSidebar();
    }
  };

  return (
    <div className="header-actions">
      <Button
        className={classNames('mr-1', {
          'normal-border': !infoSidebarIsOpen(),
          'open-border': infoSidebarIsOpen(),
        })}
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={handleOnClickInfoSidebar}
      >
        {intl.formatMessage(messages.libraryInfoButton)}
      </Button>
      {!componentPickerMode && (
        <Button
          className="ml-1"
          iconBefore={Add}
          variant="primary rounded-0"
          onClick={openAddContentSidebar}
          disabled={!canEditLibrary}
        >
          {intl.formatMessage(messages.newContentButton)}
        </Button>
      )}
    </div>
  );
};

const SubHeaderTitle = ({ title, showReadOnlyBadge }: { title: string, showReadOnlyBadge: boolean }) => {
  const intl = useIntl();

  return (
    <Stack direction="vertical">
      {title}
      {showReadOnlyBadge && (
        <div>
          <Badge variant="primary" style={{ fontSize: '50%' }}>
            {intl.formatMessage(messages.readOnlyBadge)}
          </Badge>
        </div>
      )}
    </Stack>
  );
};

const LibraryAuthoringPage = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    libraryId,
    libraryData,
    isLoadingLibraryData,
    componentPickerMode,
    sidebarBodyComponent,
    openInfoSidebar,
  } = useLibraryContext();

  const currentPath = location.pathname.split('/').pop();
  let initialActiveKey: string | undefined;
  if (componentPickerMode || currentPath === libraryId || currentPath === '') {
    initialActiveKey = TabList.home;
  } else if (currentPath && currentPath in TabList) {
    initialActiveKey = TabList[currentPath];
  }

  const [activeKey, setActiveKey] = useState<string | undefined>(initialActiveKey);

  useEffect(() => {
    if (!componentPickerMode) {
      openInfoSidebar();
    }
  }, []);

  const [searchParams] = useSearchParams();

  if (isLoadingLibraryData) {
    return <Loading />;
  }

  if (activeKey === undefined) {
    return <NotFoundAlert />;
  }

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (!componentPickerMode) {
      navigate({
        pathname: key,
        search: searchParams.toString(),
      });
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
        {!componentPickerMode && (
          <Header
            number={libraryData.slug}
            title={libraryData.title}
            org={libraryData.org}
            contextId={libraryId}
            isLibrary
            containerProps={{
              size: undefined,
            }}
          />
        )}
        <Container className="px-4 mt-4 mb-5 library-authoring-page">
          <SearchContextProvider
            extraFilter={`context_key = "${libraryId}"`}
          >
            <SubHeader
              title={(
                <SubHeaderTitle
                  title={libraryData.title}
                  showReadOnlyBadge={!componentPickerMode && !libraryData.canEditLibrary}
                />
              )}
              subtitle={intl.formatMessage(messages.headingSubtitle)}
              headerActions={(
                <HeaderActions canEditLibrary={libraryData.canEditLibrary} />
              )}
            />
            <SearchKeywordsField className="w-50" />
            <div className="d-flex mt-3 align-items-center">
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <div className="flex-grow-1" />
              <SearchSortWidget />
            </div>
            <Tabs
              variant="tabs"
              activeKey={activeKey}
              onSelect={handleTabChange}
              className="my-3"
            >
              <Tab eventKey={TabList.home} title={intl.formatMessage(messages.homeTab)}>
                <LibraryHome
                  tabList={TabList}
                  handleTabChange={handleTabChange}
                />
              </Tab>
              <Tab eventKey={TabList.components} title={intl.formatMessage(messages.componentsTab)}>
                <LibraryComponents
                  variant="full"
                />
              </Tab>
              <Tab eventKey={TabList.collections} title={intl.formatMessage(messages.collectionsTab)}>
                <LibraryCollections
                  variant="full"
                />
              </Tab>
            </Tabs>
          </SearchContextProvider>
        </Container>
        {!componentPickerMode && <StudioFooter containerProps={{ size: undefined }} />}
      </div>
      {!!sidebarBodyComponent && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar />
        </div>
      )}
    </div>
  );
};

export default LibraryAuthoringPage;
