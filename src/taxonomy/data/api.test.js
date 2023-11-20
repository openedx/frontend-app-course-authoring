import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { taxonomyListMock } from '../__mocks__';

import {
  getExportTaxonomyApiUrl,
  getTaxonomyExportFile,
  getTaxonomyListApiUrl,
  getTaxonomyListData,
  getTaxonomyTemplateApiUrl,
  getTaxonomyTemplateFile,
} from './api';

let axiosMock;

describe('taxonomy api calls', () => {
  const { location } = window;
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    delete window.location;
    window.location = {
      href: '',
    };
  });

  afterAll(() => {
    window.location = location;
  });

it('should get taxonomy list data with org', async () => {
    const org = 'testOrg';
    axiosMock.onGet(getTaxonomyListApiUrl(org)).reply(200, taxonomyListMock);
    const result = await getTaxonomyListData(org);

    expect(axiosMock.history.get[0].url).toEqual(getTaxonomyListApiUrl(org));
    expect(result).toEqual(taxonomyListMock);
  });

  it('Export should set window.location.href correctly', () => {
    const pk = 1;
    const format = 'json';

    getTaxonomyExportFile(pk, format);

    expect(window.location.href).toEqual(getExportTaxonomyApiUrl(pk, format));
  });

  it('Download template should set window.location.href correctly', () => {
    ['json', 'csv'].forEach((format) => {
      getTaxonomyTemplateFile(format);
      expect(window.location.href).toEqual(getTaxonomyTemplateApiUrl(format));
    });
  });
});
