/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'assets',
  initialState: {
    assetIds: [],
    loadingStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    addingStatus: '',
    deletingStatus: '',
    assetsApiStatus: {},
    totalCount: 0,
  },
  reducers: {
    setAssetIds: (state, { payload }) => {
      state.assetIds = payload.assetIds;
    },
    setTotalCount: (state, { payload }) => {
      state.totalCount = payload.totalCount;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateAddingStatus: (state, { payload }) => {
      state.addingStatus = payload.status;
    },
    updateDeletingStatus: (state, { payload }) => {
      state.deletingStatus = payload.status;
    },
    deleteAssetSuccess: (state, { payload }) => {
      state.assetIds = state.assetIds.filter(id => id !== payload.assetId);
    },
    addAssetSuccess: (state, { payload }) => {
      state.assetIds = [payload.assetId, ...state.assetIds];
    },
  },
});

export const {
  setAssetIds,
  setTotalCount,
  updateLoadingStatus,
  updateSavingStatus,
  deleteAssetSuccess,
  updateDeletingStatus,
  addAssetSuccess,
  updateAddingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
