import './App.css'
import Navbar from './components/Navbar'
import RouterConfig from './config/RouterConfig'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      
      <Navbar></Navbar>
      <RouterConfig></RouterConfig>
    </>
  )
}

export default App
