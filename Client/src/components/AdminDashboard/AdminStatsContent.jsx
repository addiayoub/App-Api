import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import * as echarts from 'echarts'; // Add this import

import ReactECharts from 'echarts-for-react';
import { 
  Users, UserPlus, Activity, Database, Server, 
  CreditCard, TicketIcon, ArrowUpRight, TrendingUp,
  BarChart2, PieChart, LineChart, Cpu, Shield, 
  Zap, Rocket, Sparkles, Globe, HardDrive, Network,
  Calendar, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';

const AdminStatsContent = ({ users, systemStats, subscriptions, logs }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userGrowth: [],
    subscriptionData: [],
    systemMetrics: {},
    ticketStats: {},
    activeUsers: 0,
    revenueData: []
  });

  // Fetch detailed stats when component mounts or props change
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch additional stats if not provided via props
        const [userGrowthRes, revenueRes, ticketRes, systemRes] = await Promise.all([
          !users ? axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats/users`, { headers }) : Promise.resolve({ data: [] }),
          !subscriptions ? axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats/revenue`, { headers }) : Promise.resolve({ data: [] }),
          !logs ? axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats/tickets`, { headers }) : Promise.resolve({ data: {} }),
          !systemStats ? axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats/system`, { headers }) : Promise.resolve({ data: {} })
        ]);

        // Process user growth data
        const userGrowthData = userGrowthRes.data.data || [];
        const subscriptionData = subscriptions || [];
        const revenueData = revenueRes.data.data || [];
        const ticketStats = ticketRes.data.data || {};
        const systemMetrics = systemRes.data.data || {};

        // Calculate active users (logged in last 30 days)
        const activeUsers = users 
          ? users.filter(user => {
              if (!user.lastLogin) return false;
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(user.lastLogin) >= thirtyDaysAgo;
            }).length 
          : 0;

        setStats({
          userGrowth: userGrowthData,
          subscriptionData,
          systemMetrics,
          ticketStats,
          activeUsers,
          revenueData
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [users, systemStats, subscriptions, logs]);

  // User growth chart options
  const getUserGrowthOptions = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      backgroundColor: 'transparent'
    },
    xAxis: {
      type: 'category',
      data: stats.userGrowth.map(item => item.month),
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#4B5563' } },
      splitLine: { lineStyle: { color: '#1F2937' } },
      axisLabel: { color: '#9CA3AF' }
    },
    series: [{
      name: 'Nouveaux utilisateurs',
      type: 'bar',
      data: stats.userGrowth.map(item => item.count),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#8B5CF6' },
          { offset: 1, color: '#6366F1' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#7C3AED' },
            { offset: 1, color: '#4F46E5' }
          ])
        }
      },
      animationDelay: (idx) => idx * 100
    }],
    animationEasing: 'elasticOut',
    animationDelayUpdate: (idx) => idx * 5
  });

  // Subscription distribution chart
  const getSubscriptionPieOptions = () => {
    const planCounts = {};
    stats.subscriptionData.forEach(sub => {
      planCounts[sub.plan] = (planCounts[sub.plan] || 0) + 1;
    });

    const data = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value
    }));

    return {
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#9CA3AF' }
      },
      series: [{
        name: 'Abonnements',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1F2937',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: { show: true, fontSize: '18', fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: data.map(item => ({
          ...item,
          itemStyle: {
            color: getPlanColor(item.name)
          }
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx) => idx * 100
      }]
    };
  };

  // System metrics gauge charts
  const getSystemGaugeOptions = (title, value, max) => ({
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { color: getGaugeColor(value/max) }
      },
      axisLine: {
        lineStyle: { width: 15, color: [[1, '#1F2937']] }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 20,
        fontWeight: 'bolder',
        color: '#E5E7EB',
        formatter: `{value}%\n${title}`,
        offsetCenter: ['0%', '0%']
      },
      data: [{ value: Math.round((value/max)*100) }]
    }]
  });

  // Revenue trend chart
  const getRevenueOptions = () => ({
    tooltip: { trigger: 'axis' },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.revenueData.map(item => item.month),
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#4B5563' } },
      splitLine: { lineStyle: { color: '#1F2937' } },
      axisLabel: { 
        color: '#9CA3AF',
        formatter: '${value}'
      }
    },
    series: [{
      name: 'Revenue',
      type: 'line',
      smooth: true,
      lineStyle: { width: 3, color: '#10B981' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#10B981',
        borderColor: '#047857',
        borderWidth: 2
      },
      data: stats.revenueData.map(item => item.amount),
      animationType: 'scale',
      animationEasing: 'elasticOut'
    }]
  });

  // Helper functions
  const getPlanColor = (plan) => {
    switch(plan.toLowerCase()) {
      case 'basique': return '#3B82F6';
      case 'pro': return '#8B5CF6';
      case 'entreprise': return '#10B981';
      default: return '#F59E0B';
    }
  };

  const getGaugeColor = (percentage) => {
    if (percentage > 0.7) return '#EF4444';
    if (percentage > 0.4) return '#F59E0B';
    return '#10B981';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-purple-500"
        >
          <Activity className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Users Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Utilisateurs totaux</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatNumber(users?.length || 0)}
              </p>
              <div className="flex items-center mt-2 text-sm text-green-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>{stats.userGrowth[stats.userGrowth.length - 1]?.growthRate || 0}% ce mois</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-900/20 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Active Users Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Utilisateurs actifs</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatNumber(stats.activeUsers)}
              </p>
              <div className="flex items-center mt-2 text-sm text-blue-400">
                <Activity className="w-4 h-4 mr-1" />
                <span>{Math.round((stats.activeUsers / (users?.length || 1)) * 100)}% d'activité</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-900/20 text-blue-400">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Revenue Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Revenue mensuel</p>
              <p className="text-3xl font-bold text-white mt-1">
                ${formatNumber(stats.revenueData[stats.revenueData.length - 1]?.amount || 0)}
              </p>
              <div className="flex items-center mt-2 text-sm text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{stats.revenueData[stats.revenueData.length - 1]?.growth || 0}% vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-900/20 text-green-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Tickets Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tickets ouverts</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatNumber(stats.ticketStats.open || 0)}
              </p>
              <div className="flex items-center mt-2 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>{stats.ticketStats.urgent || 0} urgents</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-yellow-900/20 text-yellow-400">
              <TicketIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* User Growth Chart */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart2 className="text-purple-400" />
              Croissance des utilisateurs
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>12 derniers mois</span>
            </div>
          </div>
          <ReactECharts 
            option={getUserGrowthOptions()} 
            style={{ height: '300px', width: '100%' }} 
            className="echarts-for-react"
          />
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="text-blue-400" />
              Répartition des abonnements
            </h3>
          </div>
          <ReactECharts 
            option={getSubscriptionPieOptions()} 
            style={{ height: '300px', width: '100%' }} 
            className="echarts-for-react"
          />
        </motion.div>
      </motion.div>

      {/* Second Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Revenue Trend */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <LineChart className="text-green-400" />
              Tendance des revenus
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>6 derniers mois</span>
            </div>
          </div>
          <ReactECharts 
            option={getRevenueOptions()} 
            style={{ height: '300px', width: '100%' }} 
            className="echarts-for-react"
          />
        </motion.div>

        {/* System Metrics */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Server className="text-amber-400" />
              Métriques système
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>Temps réel</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40">
              <ReactECharts 
                option={getSystemGaugeOptions('CPU', stats.systemMetrics.cpuUsage || 0, 100)} 
                style={{ height: '100%', width: '100%' }} 
              />
            </div>
            <div className="h-40">
              <ReactECharts 
                option={getSystemGaugeOptions('Mémoire', stats.systemMetrics.memoryUsage || 0, 100)} 
                style={{ height: '100%', width: '100%' }} 
              />
            </div>
            <div className="h-40">
              <ReactECharts 
                option={getSystemGaugeOptions('Stockage', stats.systemMetrics.storageUsage || 0, 100)} 
                style={{ height: '100%', width: '100%' }} 
              />
            </div>
            <div className="h-40">
              <ReactECharts 
                option={getSystemGaugeOptions('Réseau', stats.systemMetrics.networkUsage || 0, 1000)} 
                style={{ height: '100%', width: '100%' }} 
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Activity className="text-blue-400" />
          Statistiques rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Utilisateurs premium</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.subscriptionData.filter(s => s.plan !== 'free').length}
            </p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">Nouveaux (7j)</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.userGrowth.slice(-1)[0]?.weeklyNewUsers || 0}
            </p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Tickets résolus</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.ticketStats.solved || 0}
            </p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Pays actifs</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {users ? new Set(users.map(u => u.country)).size : 0}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminStatsContent;///v1