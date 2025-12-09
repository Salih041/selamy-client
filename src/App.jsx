import './App.css'
import Navbar from './components/Navbar'
import RouterConfig from './config/RouterConfig'
import { Toaster } from 'react-hot-toast'
import FloatingPostButton from './components/FloatingPostButton'
import ScrollToTop from './components/ScrollTop'
import Footer from './components/Footer'
import { Helmet } from 'react-helmet'

function App() {

  return (
    <>
      <ScrollToTop></ScrollToTop>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Helmet>
          <title>SelamY</title>
        </Helmet>
        <Navbar></Navbar>
        <div style={{flex: 1}}>
          <RouterConfig></RouterConfig>
        </div>
        <Footer></Footer>
        <FloatingPostButton />
      </div>

    </>
  )
}

export default App
