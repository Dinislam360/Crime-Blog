import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'quill/dist/quill.snow.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { persistor, store } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor} >
        <ToastContainer />
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>

      </PersistGate>
    </Provider>
  </StrictMode>
)
