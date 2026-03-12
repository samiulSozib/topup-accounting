import { useLanguage } from '@/contexts/LanguageContext';
import { monthlyData } from '@/data/dummyData';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const ReportsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-foreground">{t('reports')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('monthlyPurchase')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <Tooltip />
              <Bar dataKey="purchase" fill="hsl(210 85% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('monthlySales')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="hsl(168 80% 36%)" fill="hsl(168 80% 36% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('monthlyProfit')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="hsl(15 90% 60%)" strokeWidth={3} dot={{ r: 5, fill: 'hsl(15 90% 60%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
