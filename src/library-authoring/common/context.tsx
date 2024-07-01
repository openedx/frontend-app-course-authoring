/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';

export interface LibraryContextData {
  sidebarBodyComponent: string | null;
  closeLibrarySidebar: Function;
  openAddContentSidebar: Function;
  openInfoSidebar: Function;
}

export const LibraryContext = React.createContext({
  sidebarBodyComponent: null,
  closeLibrarySidebar: () => {},
  openAddContentSidebar: () => {},
  openInfoSidebar: () => {},
} as LibraryContextData);

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = (props: { children?: React.ReactNode }) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<string | null>(null);

  const closeLibrarySidebar = React.useCallback(() => setSidebarBodyComponent(null), []);
  const openAddContentSidebar = React.useCallback(() => setSidebarBodyComponent('add-content'), []);
  const openInfoSidebar = React.useCallback(() => setSidebarBodyComponent('info'), []);

  const context = React.useMemo(() => ({
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
  }), [
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
  ]);

  return (
    <LibraryContext.Provider value={context}>
      {props.children}
    </LibraryContext.Provider>
  );
};
