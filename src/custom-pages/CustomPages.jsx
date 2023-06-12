import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  Layout,
  Hyperlink,
  StatefulButton,
  Icon,
  useToggle,
  Image,
  ModalDialog,
  Alert,
} from '@edx/paragon';
import { Add, Info, SpinnerSimple } from '@edx/paragon/icons';
import { DraggableList, SortableItem } from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels } from '../generic/model-store';
import { getLoadingStatus } from './data/selectors';
import { addSingleCustomPage, fetchCustomPages, updatePageOrder } from './data/thunks';

import previewLmsStaticPages from './data/images/previewLmsStaticPages.png';
import CustomPageCard from './CustomPageCard';
import messages from './messages';
import CustomPagesProvider from './CustomPagesProvider';

const CustomPages = ({ courseId, intl }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCustomPages(courseId));
  }, [courseId]);

  const { config } = useContext(AppContext);
  const [isOpen, open, close] = useToggle(false);
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;

  const customPagesIds = useSelector(state => state.customPages.customPagesIds);
  const addPageStatus = useSelector(state => state.customPages.addingStatus);
  const deletePageStatus = useSelector(state => state.customPages.deletingStatus);
  const loadingStatus = useSelector(getLoadingStatus);

  const pages = useModels('customPages', customPagesIds);
  const [orderedPages, setOrderedPages] = useState(pages);
  const handleAddPage = () => { dispatch(addSingleCustomPage(courseId)); };
  const handleReorder = () => (newPageOrder) => {
    dispatch(updatePageOrder(courseId, newPageOrder, orderedPages));
  };

  const addPageStateProps = {
    labels: {
      default: intl.formatMessage(messages.addPageBodyLabel),
      pending: intl.formatMessage(messages.addingPageBodyLabel),
    },
    icons: {
      default: <Icon src={Add} />,
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
    },
    disabledStates: ['pending'],
  };

  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return null;
  }
  return (
    <CustomPagesProvider courseId={courseId}>
      <main className="container container-mw-xl p-4 pt-5">
        <div className="small gray-700">
          <Breadcrumb
            ariaLabel="Breadcrumb basic"
            links={[
              { label: 'Content', href: `${config.STUDIO_BASE_URL}/course/${courseId}` },
              { label: 'Pages and Resources', href: `/course/${courseId}/pages-and-resources` },
            ]}
          />
        </div>
        <ActionRow>
          <div className="h2">
            <FormattedMessage {...messages.heading} />
          </div>
          <ActionRow.Spacer />
          <Button iconBefore={Add} onClick={handleAddPage}>
            <FormattedMessage {...messages.addPageHeaderLabel} />
          </Button>
          <Hyperlink
            destination={learningCourseURL}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
          >
            <Button>
              <FormattedMessage {...messages.viewLiveLabel} />
            </Button>
          </Hyperlink>
        </ActionRow>
        <hr />
        <Layout
          lg={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          md={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          sm={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          xs={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          xl={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
        >
          <Layout.Element>
            {deletePageStatus === RequestStatus.FAILED && <Alert variant="danger" icon={Info} dismissable>Unable to delete page. Please try again.</Alert>}
            {addPageStatus === RequestStatus.FAILED && <Alert variant="danger" icon={Info} dismissable>Unable to add page. Please try again.</Alert>}
            <div className="small gray-700 mb-4">
              <FormattedMessage {...messages.note} />
            </div>
            <DraggableList itemList={pages} setState={setOrderedPages} updateOrder={handleReorder}>
              {pages.map((page) => (
                <SortableItem
                  id={page.id}
                  key={page.id}
                  componentStyle={{
                    background: 'white',
                    borderRadius: '6px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0px 1px 5px #ADADAD',
                  }}
                >
                  <CustomPageCard
                    page={page}
                    dispatch={dispatch}
                    deletePageStatus={deletePageStatus}
                    courseId={courseId}
                  />
                </SortableItem>
              ))}
            </DraggableList>
            <StatefulButton onClick={handleAddPage} state={addPageStatus} {...addPageStateProps} />
          </Layout.Element>
          <Layout.Element>
            <div className="h4">
              <FormattedMessage {...messages.pageExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.pageExplanationBody} />
            </div>
            <hr />
            <div className="h4">
              <FormattedMessage {...messages.customPagesExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.customPagesExplanationBody} />
            </div>
            <hr />
            <div className="h4">
              <FormattedMessage {...messages.studentViewExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.studentViewExplanationBody} />
            </div>
            <Button variant="link" size="sm" onClick={open} className="pl-0">
              <FormattedMessage {...messages.studentViewExampleButton} />
            </Button>
          </Layout.Element>
        </Layout>
        <ModalDialog
          isOpen={isOpen}
          onClose={close}
          size="lg"
          title={intl.formatMessage(messages.studentViewModalTitle)}
        >
          <ModalDialog.Header>
            <ModalDialog.Title>
              <FormattedMessage {...messages.studentViewModalTitle} />
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <Image src={previewLmsStaticPages} fluid className="mb-3" />
            <div className="small">
              <FormattedMessage {...messages.studentViewModalBody} />
            </div>
          </ModalDialog.Body>
        </ModalDialog>
      </main>
    </CustomPagesProvider>
  );
};

CustomPages.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CustomPages);
