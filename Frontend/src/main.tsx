import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import NavContext from './context/NavContext.tsx'
createRoot(document.getElementById('root')!).render(
	<BrowserRouter>	
		<NavContext>
  			<StrictMode>
    				<App />
  			</StrictMode>,
		</NavContext>
	</BrowserRouter>
)
