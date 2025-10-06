import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const repository = process.env.GITHUB_REPOSITORY;
  const repoName = repository?.split('/')[1];
  const base = mode === 'production' && repoName ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      open: true
    }
  };
});
