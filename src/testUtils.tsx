/* istanbul ignore file */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * Helper functions for writing tests.
 */
import React from 'react';
import { AxiosError } from 'axios';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import {
  MemoryRouter,
  MemoryRouterProps,
  Route,
  Routes,
} from 'react-router-dom';

import initializeReduxStore from './store';

/** @deprecated Use React Query and/or regular React Context instead of redux */
let reduxStore;
let queryClient;
let axiosMock: MockAdapter;

export interface RouteOptions {
  /** The URL path, like '/libraries/:libraryId' */
  path?: string;
  /** The URL parameters, like {libraryId: 'lib:org:123'} */
  params?: Record<string, string>;
  /** and/or instead of specifying path and params, specify MemoryRouterProps */
  routerProps?: MemoryRouterProps;
}

/**
 * This component works together with the custom `render()` method we have in
 * this file to provide whatever react-router context you need for your
 * component.
 *
 * In the simplest case, you don't need to worry about the router at all, so
 * just render your component using `render(<TheComponent />)`.
 *
 * The next simplest way to use it is to specify `path` (the route matching rule
 * that is normally used to determine when to show the component or its parent
 * page) and `params` like this:
 *
 * ```
 * render(<LibraryLayout />, { path: '/library/:libraryId/*', params: { libraryId: 'lib:Axim:testlib' } });
 * ```
 *
 * In this case, components that use the `useParams` hook will get the right
 * library ID, and we don't even have to mock anything.
 *
 * In other cases, such as when you have routes inside routes, you'll need to
 * set the router's `initialEntries` (URL history) prop yourself, like this:
 *
 * ```
 * render(<LibraryLayout />, {
 *   path: '/library/:libraryId/*',
 *   // The root component is mounted on the above path, as it is in the "real"
 *   // MFE. But to access the 'settings' sub-route/component for this test, we
 *   // need tospecify the URL like this:
 *   routerProps: { initialEntries: [`/library/${libraryId}/settings`] },
 * });
 * ```
 */
const RouterAndRoute: React.FC<RouteOptions> = ({
  children,
  path = '/',
  params = {},
  routerProps = {},
}) => {
  if (Object.entries(params).length > 0 || path !== '/') {
    const newRouterProps = { ...routerProps };
    if (!routerProps.initialEntries) {
      // Substitute the params into the URL so '/library/:libraryId' becomes '/library/lib:org:123'
      let pathWithParams = path;
      for (const [key, value] of Object.entries(params)) {
        pathWithParams = pathWithParams.replaceAll(`:${key}`, value);
      }
      if (pathWithParams.endsWith('/*')) {
        // Some routes (that contain child routes) need to end with /* in the <Route> but not in the router
        pathWithParams = pathWithParams.substring(0, pathWithParams.length - 1);
      }
      newRouterProps.initialEntries = [pathWithParams];
    }
    return (
      <MemoryRouter {...newRouterProps}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    );
  }
  return (
    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
  );
};

function makeWrapper({ ...routeArgs }: RouteOptions) {
  const AllTheProviders = ({ children }) => (
    <AppProvider store={reduxStore} wrapWithRouter={false}>
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <RouterAndRoute {...routeArgs}>
            {children}
          </RouterAndRoute>
        </QueryClientProvider>
      </IntlProvider>
    </AppProvider>
  );
  return AllTheProviders;
}

/**
 * Same as render() from `@testing-library/react` but this one provides all the
 * wrappers our React components need to render properly.
 */
function customRender(ui: React.ReactElement, options: RouteOptions = {}): RenderResult {
  return render(ui, { wrapper: makeWrapper(options) });
}

const defaultUser = {
  userId: 3,
  username: 'abc123',
  administrator: true,
  roles: [],
} as const;

/**
 * Initialize common mocks that many of our React components will require.
 *
 * This should be called within each test case, or in `beforeEach()`.
 *
 * Returns the new `axiosMock` in case you need to mock out axios requests.
 */
export function initializeMocks({ user = defaultUser } = {}) {
  initializeMockApp({
    authenticatedUser: user,
  });
  reduxStore = initializeReduxStore();
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());

  return {
    reduxStore,
    axiosMock,
  };
}

export * from '@testing-library/react';
export { customRender as render };

/** Simulate a real Axios error (such as we'd see in response to a 404) */
export function createAxiosError({ code, message, path }: { code: number, message: string, path: string }) {
  const request = { path };
  const config = {};
  const error = new AxiosError(
    `Mocked request failed with status code ${code}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    request,
    {
      status: code,
      data: { detail: message },
      statusText: 'error',
      config,
      headers: {},
    },
  );
  return error;
}
