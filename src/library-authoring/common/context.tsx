import { useToggle } from '@openedx/paragon';
import React from 'react';

import type { ContentLibrary } from '../data/api';
import { useContentLibrary } from '../data/apiHooks';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export interface LibraryContextData {
  /** The ID of the current library */
  libraryId: string;
  libraryData?: ContentLibrary;
  readOnly: boolean;
  isLoadingLibraryData: boolean;
  // Whether we're in "component picker" mode
  componentPickerMode: boolean;
  // Sidebar stuff - only one sidebar is active at any given time:
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  currentComponentUsageKey?: string;
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Current collection
  openCollectionInfoSidebar: (collectionId: string) => void;
  currentCollectionId?: string;
  // Editor modal - for editing some component
  /** If the editor is open and the user is editing some component, this is its usageKey */
  componentBeingEdited: string | undefined;
  openComponentEditor: (usageKey: string) => void;
  closeComponentEditor: () => void;
}

/**
 * Library Context.
 * Always available when we're in the context of a single library.
 *
 * Get this using `useLibraryContext()`
 *
 * Not used on the "library list" on Studio home.
 */
const LibraryContext = React.createContext<LibraryContextData | undefined>(undefined);

interface LibraryProviderProps {
  children?: React.ReactNode;
  libraryId: string;
  componentPickerMode?: boolean;
  collectionId?: string;
  componentUsageKey?: string;
}

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  componentPickerMode = false,
  collectionId,
  componentUsageKey,
}: LibraryProviderProps) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<SidebarBodyComponentId | null>(null);
  const [currentComponentUsageKey, setCurrentComponentUsageKey] = React.useState<string | undefined>(componentUsageKey);
  const [currentCollectionId, setcurrentCollectionId] = React.useState<string | undefined>(collectionId);
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = React.useState<string | undefined>();
  const closeComponentEditor = React.useCallback(() => openComponentEditor(undefined), []);

  const resetSidebar = React.useCallback(() => {
    setCurrentComponentUsageKey(undefined);
    setcurrentCollectionId(undefined);
    setSidebarBodyComponent(null);
  }, []);

  const closeLibrarySidebar = React.useCallback(() => {
    resetSidebar();
    setCurrentComponentUsageKey(undefined);
  }, []);
  const openAddContentSidebar = React.useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.AddContent);
  }, []);
  const openInfoSidebar = React.useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.Info);
  }, []);
  const openComponentInfoSidebar = React.useCallback(
    (usageKey: string) => {
      resetSidebar();
      setCurrentComponentUsageKey(usageKey);
      setSidebarBodyComponent(SidebarBodyComponentId.ComponentInfo);
    },
    [],
  );
  const openCollectionInfoSidebar = React.useCallback((newCollectionId: string) => {
    resetSidebar();
    setcurrentCollectionId(newCollectionId);
    setSidebarBodyComponent(SidebarBodyComponentId.CollectionInfo);
  }, []);

  const { data: libraryData, isLoading: isLoadingLibraryData } = useContentLibrary(libraryId);

  const readOnly = componentPickerMode || !libraryData?.canEditLibrary;

  const context = React.useMemo<LibraryContextData>(() => ({
    libraryId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  }), [
    libraryId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  ]);

  return (
    <LibraryContext.Provider value={context}>
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibraryContext(): LibraryContextData {
  const ctx = React.useContext(LibraryContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useLibraryContext() was used in a component without a <LibraryProvider> ancestor.');
  }
  return ctx;
}
