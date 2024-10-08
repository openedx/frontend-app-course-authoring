import { setConfig, getConfig } from '@edx/frontend-platform';

import {
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import { mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentManagement from './ComponentManagement';
import { mockContentTaxonomyTagsData } from '../../content-tags-drawer/data/api.mocks';

jest.mock('../../content-tags-drawer', () => ({
  ContentTagsDrawer: () => <div>Mocked ContentTagsDrawer</div>,
}));

/*
 * This function is used to get the inner text of an element.
 * https://stackoverflow.com/questions/47902335/innertext-is-undefined-in-jest-test
 */
const getInnerText = (element: Element) => element?.textContent
  ?.split('\n')
  .filter((text) => text && !text.match(/^\s+$/))
  .map((text) => text.trim())
  .join(' ');

const matchInnerText = (nodeName: string, textToMatch: string) => (_: string, element: Element) => (
  element.nodeName === nodeName && getInnerText(element) === textToMatch
);

describe('<ComponentManagement />', () => {
  it('should render draft status', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(await screen.findByText('(Never Published)')).toBeInTheDocument();
    expect(screen.getByText(matchInnerText('SPAN', 'Draft saved on June 20, 2024 at 13:54.'))).toBeInTheDocument();
  });

  it('should render published status', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyPublished} />);
    expect(await screen.findByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(
      screen.getByText(matchInnerText('SPAN', 'Last published on June 21, 2024 at 24:00 by Luke.')),
    ).toBeInTheDocument();
  });

  it('should render the tagging info', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    expect(await screen.findByText('Tags (0)')).toBeInTheDocument();
    expect(screen.queryByText('Mocked ContentTagsDrawer')).toBeInTheDocument();
  });

  it('should not render draft status', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('should render tag count in tagging info', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    mockContentTaxonomyTagsData.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyForTags} />);
    expect(await screen.findByText('Tags (6)')).toBeInTheDocument();
  });
});
