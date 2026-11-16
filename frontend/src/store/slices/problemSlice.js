import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../utils/axiosClient';

export const fetchAllProblems = createAsyncThunk(
  'problems/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUserProblemStats = createAsyncThunk(
  'problems/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const [solvedRes, attemptedRes] = await Promise.all([
        axiosClient.get('/problem/problemSolvedByUser').catch(() => ({ data: [] })),
        axiosClient.get('/problem/problemAttemptedByUser').catch(() => ({ data: [] }))
      ]);
      return {
        solved: Array.isArray(solvedRes.data) ? solvedRes.data : [],
        attempted: Array.isArray(attemptedRes.data) ? attemptedRes.data : []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'problems/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/leaderboard');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const problemSlice = createSlice({
  name: 'problems',
  initialState: {
    problems: [],
    solvedProblems: [],
    attemptedProblems: [],
    leaderboard: [],
    leaderboardLoaded: false,
    loading: false,
    initialLoaded: false,
    error: null
  },
  reducers: {
    removeProblemFromState: (state, action) => {
      const id = action.payload;
      state.problems = state.problems.filter((p) => p._id !== id);
      state.solvedProblems = state.solvedProblems.filter((p) => p._id !== id);
      state.attemptedProblems = state.attemptedProblems.filter((p) => p._id !== id);
    },
    markProblemSolved: (state, action) => {
      const id = action.payload;
      if (!state.solvedProblems.some((p) => p._id === id)) {
        state.solvedProblems.push({ _id: id });
      }
      state.attemptedProblems = state.attemptedProblems.filter((p) => p._id !== id);
    },
    markProblemAttempted: (state, action) => {
      const id = action.payload;
      const isAlreadySolved = state.solvedProblems.some((p) => p._id === id);
      if (!isAlreadySolved && !state.attemptedProblems.some((p) => p._id === id)) {
        state.attemptedProblems.push({ _id: id });
      }
    },
    invalidateProblems: (state) => {
      state.initialLoaded = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllProblems
      .addCase(fetchAllProblems.pending, (state) => {
        if (!state.initialLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllProblems.fulfilled, (state, action) => {
        state.problems = action.payload;
        state.loading = false;
        state.initialLoaded = true;
      })
      .addCase(fetchAllProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchUserProblemStats
      .addCase(fetchUserProblemStats.fulfilled, (state, action) => {
        state.solvedProblems = action.payload.solved;
        state.attemptedProblems = action.payload.attempted;
      })
      // fetchLeaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
        state.leaderboardLoaded = true;
      });
  }
});

export const {
  removeProblemFromState,
  markProblemSolved,
  markProblemAttempted,
  invalidateProblems
} = problemSlice.actions;

export default problemSlice.reducer;

