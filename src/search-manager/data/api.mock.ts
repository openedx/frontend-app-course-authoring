/* istanbul ignore file */
// eslint-disable-next-line import/no-extraneous-dependencies
import fetchMock from 'fetch-mock-jest';
import type { MultiSearchResponse } from 'meilisearch';
import * as api from './api';

/**
 * Mock getContentSearchConfig()
 */
export async function mockContentSearchConfig(): ReturnType<typeof api.getContentSearchConfig> {
  return {
    url: 'http://mock.meilisearch.local',
    indexName: 'studio',
    apiKey: 'test-key',
  };
}
mockContentSearchConfig.searchEndpointUrl = 'http://mock.meilisearch.local/multi-search';
mockContentSearchConfig.applyMock = () => (
  jest.spyOn(api, 'getContentSearchConfig').mockImplementation(mockContentSearchConfig)
);

/**
 * Mock all future Meilisearch searches with the given response.
 *
 * For a given test suite, this mock will stay in effect until you call it with
 * a different mock response, or you call `fetchMock.mockReset()`
 */
export function mockSearchResult(mockResponse: MultiSearchResponse) {
  fetchMock.post(mockContentSearchConfig.searchEndpointUrl, (_url, req) => {
    const requestData = JSON.parse(req.body?.toString() ?? '');
    const query = requestData?.queries[0]?.q ?? '';
    // We have to replace the query (search keywords) in the mock results with the actual query,
    // because otherwise Instantsearch will update the UI and change the query,
    // leading to unexpected results in the test cases.
    const newMockResponse = { ...mockResponse };
    newMockResponse.results[0].query = query;
    // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    mockResponse.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
    return newMockResponse;
  }, { overwriteRoutes: true });
}

export async function mockGetBlockTypes(
  mockResponse: 'noBlocks' | 'someBlocks' | 'moreBlocks',
) {
  const mockResponseMap = {
    noBlocks: {},
    someBlocks: { problem: 1, html: 2 },
    moreBlocks: {
      advanced: 1,
      discussion: 2,
      library: 3,
      drag_and_drop_v2: 4,
      openassessment: 5,
      html: 6,
      problem: 7,
      video: 8,
    },
  };
  jest.spyOn(api, 'fetchBlockTypes').mockResolvedValue(mockResponseMap[mockResponse]);
}
mockGetBlockTypes.applyMock = () => jest.spyOn(api, 'fetchBlockTypes').mockResolvedValue({});

export const mockCollectionHit = {
  displayName: 'Collection 1',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et mi ac nisi accumsan imperdiet vitae at odio. Vivamus tempor nec lorem eget lacinia. Vivamus efficitur lacus non dapibus porta. Nulla venenatis luctus nisi id posuere. Sed sollicitudin magna a sem ultrices accumsan. Praesent volutpat tortor vitae luctus rutrum. Integer.',
  id: '1',
  type: 'collection',
  usageKey: 'lib:OpenedX:CSPROB2:collection:coll1',
  blockId: 'coll1',
  tags: {},
  breadcrumbs: [
    {
      displayName: 'CS problems 2',
    },
  ],
  created: 1725534795.628254,
  modified: 1725878053.420395,
  contextKey: 'lib:OpenedX:CSPROB2',
  org: 'OpenedX',
  formatted: {
    displayName: 'Collection 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et mi ac nisi accumsan imperdiet…',
  },
} satisfies api.CollectionHit;
