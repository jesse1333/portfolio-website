import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Experience from './pages/Experience';
import { startAboutMediaPrefetch } from './lib/aboutMediaPrefetch.js';
import './App.css';

function App() {
  useEffect(() => {
    startAboutMediaPrefetch();
  }, []);

  return (
    <Layout>
      <Home />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </Layout>
  );
}

export default App;
