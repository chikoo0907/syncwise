import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, MousePointer, MessageSquare, Calendar, Users, Target, BarChart3 } from 'lucide-react';

export default function Deliverable() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  const stats = [
    { 
      label: 'Total Event Views', 
      value: 1200, 
      change: '+23%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Registration Clicks', 
      value: 340, 
      change: '+12%',
      trend: 'up',
      icon: MousePointer,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'Messages Received', 
      value: 27, 
      change: '+8%',
      trend: 'up',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-600'
    },
  ];

  const timeframes = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' }
  ];

  // Animate numbers on mount
  useEffect(() => {
    setIsLoading(false);
    const animationDuration = 2000;
    const steps = 60;
    const stepDuration = animationDuration / steps;

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;
      
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(Math.floor(increment * currentStep), stat.value);
        
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = newValue;
          return newValues;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  }, []);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 text-lg">Track your event performance and engagement</p>
            </div>
            <div className="flex items-center space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTimeframe(tf.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === tf.value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-200`}>
                    {isLoading ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                    ) : (
                      formatNumber(animatedValues[idx])
                    )}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${isLoading ? 0 : (animatedValues[idx] / stat.value) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Overview */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Engagement Overview</h3>
              <BarChart3 className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600">Conversion Rate</span>
                </div>
                <span className="font-semibold text-slate-800">28.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-600">Avg. Session Duration</span>
                </div>
                <span className="font-semibold text-slate-800">2m 34s</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-600">Response Rate</span>
                </div>
                <span className="font-semibold text-slate-800">89%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
              <Target className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>View Audience</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}