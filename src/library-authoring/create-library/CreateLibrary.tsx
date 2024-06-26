import React, { useState } from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Container,
  Form,
  StatefulButton,
} from '@openedx/paragon';
import axios from 'axios';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { REGEX_RULES } from '../../constants';
import Header from '../../header';
import FormikControl from '../../generic/FormikControl';
import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import { useOrganizationListData } from '../../generic/data/apiHooks';
import SubHeader from '../../generic/sub-header/SubHeader';
import type { CreateContentLibraryArgs } from './data/api';
import { useCreateLibraryV2 } from './data/apiHooks';
import messages from './messages';


const CreateLibrary = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState<React.ReactNode>();

  const { noSpaceRule, specialCharsRule } = REGEX_RULES;
  const validSlugIdRegex = /^[a-zA-Z\d]+(?:[\w-]*[a-zA-Z\d]+)*$/;

  const {
    mutateAsync,
  } = useCreateLibraryV2();

  const {
    data: organizationListData,
    isLoading: isOrganizationListLoading,
  } = useOrganizationListData();

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <SubHeader
          title={<FormattedMessage {...messages.createLibrary} />}
        />
        <Formik
          initialValues={{
            title: '',
            org: '',
            slug: '',
          }}
          validationSchema={
            Yup.object().shape({
              title: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError)),
              org: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  specialCharsRule,
                  intl.formatMessage(messages.disallowedCharsError),
                )
                .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
              slug: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  validSlugIdRegex,
                  intl.formatMessage(messages.invalidSlugError),
                ),
            })
          }
          onSubmit={async (values: CreateContentLibraryArgs) => {
            setApiError(undefined);
            try {
              const data = await mutateAsync(values);
              navigate(`/library/${data.id}`);
            } catch (error: any) {
              if (axios.isAxiosError(error)) {
                setApiError((
                  <>
                    {error.message}
                    <br />
                    {JSON.stringify(error.response?.data)}
                  </>
                ));
              }
            }
          }}
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <FormikControl
                name="title"
                label={<Form.Label>{intl.formatMessage(messages.titleLabel)}</Form.Label>}
                value={formikProps.values.title}
                placeholder={intl.formatMessage(messages.titlePlaceholder)}
                help={intl.formatMessage(messages.titleHelp)}
              />
              <Form.Group>
                <Form.Label>{intl.formatMessage(messages.orgLabel)}</Form.Label>
                <Form.Autosuggest
                  name="org"
                  isLoading={isOrganizationListLoading}
                  onChange={(event) => formikProps.setFieldValue('org', event.selectionId)}
                  placeholder={intl.formatMessage(messages.orgPlaceholder)}
                >
                  {organizationListData ? organizationListData.map((org) => (
                    <Form.AutosuggestOption key={org} id={org}>{org}</Form.AutosuggestOption>
                  )) : []}
                </Form.Autosuggest>
                <FormikErrorFeedback name="org">
                  <Form.Text>{intl.formatMessage(messages.orgHelp)}</Form.Text>
                </FormikErrorFeedback>
              </Form.Group>
              <FormikControl
                name="slug"
                label={<Form.Label>{intl.formatMessage(messages.slugLabel)}</Form.Label>}
                value={formikProps.values.slug}
                placeholder={intl.formatMessage(messages.slugPlaceholder)}
                help={intl.formatMessage(messages.slugHelp)}
              />
              <StatefulButton
                type="submit"
                variant="primary"
                className="action btn-primary"
                state={formikProps.isSubmitting ? 'disabled' : 'enabled'}
                disabledStates={['disabled']}
                labels={{
                  enabled: intl.formatMessage(messages.createLibraryButton),
                  disabled: intl.formatMessage(messages.createLibraryButtonPending),
                }}
              />
            </Form>
          )}
        </Formik>
        {apiError && (
          <Alert variant="danger" className="mt-3">
            {apiError}
          </Alert>
        )}
      </Container>
      <StudioFooter />
    </>
  );
};

export default CreateLibrary;
