import { configureStore } from "@reduxjs/toolkit";
import businessOwnerReducer from './slices/businessOwnerSlice'
import supplierReducer from "./slices/supplierSlice";
import resellerReducer from "./slices/resellerSlice";
import topUpTransactionReducer from './slices/topUpTransactionSlice'


export const store = configureStore({
  reducer: {
    businessOwner: businessOwnerReducer,
    supplier: supplierReducer,
    reseller: resellerReducer,
    topUpTransactions: topUpTransactionReducer,
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;