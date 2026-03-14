// import { configureStore } from "@reduxjs/toolkit";
// import businessOwnerReducer from './slices/businessOwnerSlice'
// import supplierReducer from "./slices/supplierSlice";
// import resellerReducer from "./slices/resellerSlice";
// import topUpTransactionReducer from './slices/topUpTransactionSlice'


// export const store = configureStore({
//   reducer: {
//     businessOwner: businessOwnerReducer,
//     supplier: supplierReducer,
//     reseller: resellerReducer,
//     topUpTransactions: topUpTransactionReducer,
//   },
// });

// // types
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import supplierReducer from './slices/supplierSlice';
import resellerReducer from './slices/resellerSlice';
import transactionReducer from './slices/transactionSlice';
import businessOwnerReducer from './slices/businessOwnerSlice';
import subscriptionPackageReducer from './slices/subscriptionPackage'
import packageRequestReducer from './slices/packageRequestSlice'


export const store = configureStore({
  reducer: {
    businessOwner: businessOwnerReducer,
    suppliers: supplierReducer,
    resellers: resellerReducer,
    transactions: transactionReducer,
    subscriptionPackages:subscriptionPackageReducer,
    packageRequest:packageRequestReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['suppliers/fetchSuppliers/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.config', 'payload.request'],
        // Ignore these paths in the state
        ignoredPaths: ['suppliers.error', 'resellers.error', 'transactions.error']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;