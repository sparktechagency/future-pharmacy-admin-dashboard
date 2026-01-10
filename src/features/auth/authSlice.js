
import { createSlice } from "@reduxjs/toolkit";
import { removeToken, saveToken } from "../../utils/storage";


const initialState = {
  token: "jllkjfsdf",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      saveToken(action.payload);
    },
    logout: (state) => {
      state.token = null;
      removeToken();
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
