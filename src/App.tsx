import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApiHealth } from './hooks/useApiHealth';
import { Layout } from './layout/Layout';
import { CombatStylePanel } from './features/combat-style/CombatStylePanel';
import { ArmorLoadoutPanel } from './features/armor/ArmorLoadoutPanel';
import { BossEncounterPanel } from './features/boss/BossEncounterPanel';
import { HitpointOverview } from './features/hitpoints/HitpointOverview';
import { SimulationPanel } from './features/simulation/SimulationPanel';
import { useUserConfig } from './state/UserConfigContext';
import { DataFreshnessToasts } from './components/DataFreshnessToasts';

function App(): JSX.Element {
  const { checkApis } = useApiHealth();
  const { initialiseFromStorage } = useUserConfig();

  useEffect(() => {
    checkApis();
    initialiseFromStorage();
  }, [checkApis, initialiseFromStorage]);

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="combat-style" className="space-y-6">
          <h2 id="combat-style" className="text-xl font-semibold">
            Combat Configuration
          </h2>
          <CombatStylePanel />
          <ArmorLoadoutPanel />
          <HitpointOverview />
        </section>
        <section aria-labelledby="boss-config" className="space-y-6">
          <h2 id="boss-config" className="text-xl font-semibold">
            Encounter Planner
          </h2>
          <BossEncounterPanel />
          <Suspense fallback={<FallbackCard label="Calculating defensive outcomes" />}>
            <SimulationPanel />
          </Suspense>
        </section>
      </div>
      <DataFreshnessToasts />
    </Layout>
  );
}

function FallbackCard({ label }: { label: string }): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg"
    >
      <p className="text-sm text-slate-300">{label}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full bg-emerald-500"
          animate={{ x: ['0%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

export default App;
