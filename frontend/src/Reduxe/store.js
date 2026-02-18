import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { pokemonApi } from './pokemon'
import { Api } from './Api'   // <-- import 2nd API

export const store = configureStore({
  reducer: {
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [Api.reducerPath]: Api.reducer,  // <-- add here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      pokemonApi.middleware,
      Api.middleware,  // <-- add here
    ),
})

setupListeners(store.dispatch)
