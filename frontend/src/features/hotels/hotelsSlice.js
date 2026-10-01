import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as hotelsApi from '../../api/hotelsApi';

const PAGE_SIZE = 6;

const initialState = {
  items: [],
  total: 0,
  limit: PAGE_SIZE,
  offset: 0,
  filters: { title: '', minPrice: '', maxPrice: '' },
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

// Fetches the current page using whatever filters/pagination are in state
export const loadHotels = createAsyncThunk('hotels/load', async (_, { getState, rejectWithValue }) => {
  const { hotels } = getState();
  try {
    return await hotelsApi.fetchHotels({
      title: hotels.filters.title,
      minPrice: hotels.filters.minPrice,
      maxPrice: hotels.filters.maxPrice,
      limit: hotels.limit,
      offset: hotels.offset,
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeHotel = createAsyncThunk('hotels/remove', async (id, { rejectWithValue }) => {
  try {
    await hotelsApi.deleteHotel(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.offset = 0; // reset to first page whenever filters change
    },
    setPage(state, action) {
      state.offset = action.payload * state.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHotels.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadHotels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.total = action.payload.pagination.total;
      })
      .addCase(loadHotels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load hotels';
      })
      .addCase(removeHotel.fulfilled, (state, action) => {
        state.items = state.items.filter((h) => h.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { setFilters, setPage } = hotelsSlice.actions;
export default hotelsSlice.reducer;
