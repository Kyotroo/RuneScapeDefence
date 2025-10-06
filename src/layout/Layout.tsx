import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { TopNav } from './TopNav';

export function Layout({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopNav />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-28 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
