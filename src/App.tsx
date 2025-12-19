import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>
  );
}

export default App;
