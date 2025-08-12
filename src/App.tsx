import React, { useState, useEffect } from 'react';
import { Layout, Menu, Watermark, message, Modal, Button, Typography } from 'antd';
import { 
  TrophyOutlined, 
  CrownOutlined,
  HeartOutlined, 
  CarOutlined, 
  SearchOutlined, 
  BarChartOutlined,
  SettingOutlined,
  CalculatorOutlined,
  QuestionCircleOutlined,
  FunctionOutlined,
  StarOutlined,
  ThunderboltOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import PowerRankings from './components/PowerRankings';
import HeroRankings from './components/HeroRankings';
import PetRankings from './components/PetRankings';
import RideRankings from './components/RideRankings';
import SearchPage from './components/SearchPage';
import StatisticsPage from './components/StatisticsPage';
import SettingsPanel from './components/SettingsPanel';
import SystemPowerDetails from './components/SystemPowerDetails';
import DamageSimulator from './components/DamageSimulator';
import { AppSettings } from './types';
import GodWarRankings from './components/GodWarRankings';
import LeagueRankings from './components/LeagueRankings';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('power');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    useUnits: false,
    pageSize: 50,
    serverId: null
  });
  const [announcement, setAnnouncement] = useState<string>('');
  const [visitors, setVisitors] = useState<{online: number; total: number}>({online: 0, total: 0});

  // 保存设置到 localStorage
    useEffect(() => {
      const savedSettings = localStorage.getItem('ranking-dashboard-settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('加载设置失败:', error);
        }
      }
      // 检查是否需要今日公告
      const lastDate = localStorage.getItem('last-announcement-date');
      const today = new Date().toISOString().split('T')[0];
      if (lastDate !== today) {
        setIsFirstVisit(true);
      }
    }, []);
    // 手机端默认收起侧边栏
    useEffect(() => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    }, []);

  // 新增获取公告的副作用
  useEffect(() => {
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => setAnnouncement(data.announcement))
      .catch(() => message.error('加载公告失败'));
    // 获取访问统计，使用本地唯一访客ID
    let vid = localStorage.getItem('visitor_id');
    if (!vid && window.crypto?.randomUUID) {
      vid = window.crypto.randomUUID();
      localStorage.setItem('visitor_id', vid);
    }
    fetch('/api/visitors', { headers: { 'X-Visitor-Id': vid || '' } })
      .then(res => res.json())
      .then(data => setVisitors({online: data.online, total: data.total}))
      .catch(() => console.error('加载访问统计失败'));
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ranking-dashboard-settings', JSON.stringify(newSettings));
    message.success('设置已保存');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
  };

  const handleFirstVisitClose = () => {
  setIsFirstVisit(false);
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('last-announcement-date', today);
  };

  const menuItems = [
    {
      key: 'power',
      icon: <TrophyOutlined />,
      label: '战力排行榜',
    },
    {
      key: 'hero',
      icon: <CrownOutlined />,
      label: '角色排行榜',
    },
    {
      key: 'pet',
      icon: <HeartOutlined />,
      label: '宠物排行榜',
    },
    {
      key: 'ride',
      icon: <CarOutlined />,
      label: '坐骑排行榜',
    },
    {
      key: 'godwar',
      icon: <ThunderboltOutlined />,
      label: '神魔排行榜',
    },
    {
      key: 'league',
      icon: <CrownOutlined />,
      label: '联盟排行榜',
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '全局搜索',
    },
    {
      key: 'calculator',
      icon: <CalculatorOutlined />,
      label: '六维计算器',
    },
    {
      key: 'systempower',
      icon: <FunctionOutlined />,
      label: '角色各系统详情',
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '统计分析',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'power':
        return <PowerRankings settings={settings} />;
      case 'hero':
        return <HeroRankings settings={settings} />;
      case 'pet':
        return <PetRankings settings={settings} />;
      case 'ride':
        return <RideRankings settings={settings} />;
      case 'godwar':
        return <GodWarRankings settings={settings} />;
      case 'league':
        return <LeagueRankings settings={settings} />;
      case 'search':
        return <SearchPage settings={settings} />;
      case 'calculator':
        return <DamageSimulator settings={settings} />;
      case 'systempower':
        return <SystemPowerDetails settings={settings} />;
      case 'statistics':
        return <StatisticsPage settings={settings} />;
      case 'settings':
        return <SettingsPanel settings={settings} onSave={saveSettings} />;
      default:
        return <PowerRankings settings={settings} />;
    }
  };

  return (
    <Watermark 
      content="数值研究所Q群513291473" 
      gap={[150, 100]} 
      style={{ height: '100vh' }}
      font={{
        color: 'rgba(0, 0, 0, 0.1)',
        fontSize: 16
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          trigger={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '100%' }}>
              {collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 16 }} />
              ) : (
                <><MenuFoldOutlined style={{ fontSize: 16 }} /><span style={{ marginLeft: 4, fontSize: 14 }}>收起</span></>
              )}
            </div>
          }
          theme="light"
          style={{
            boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
          }}
        >
          <div style={{ 
            height: 32, 
            margin: 16, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? '18px' : '16px',
            fontWeight: 'bold',
            color: '#1890ff'
          }}>
            {collapsed ? '🏆' : '🏆 排行榜'}
          </div>
          <Menu
            theme="light"
            defaultSelectedKeys={['power']}
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        
        <Layout className="site-layout">
          <Header style={{ 
            padding: '0 24px', 
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h1 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>
              🏆 游戏排行榜数据
            </h1>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: 16, color: '#666' }}>在线: {visitors.online} 今日访问: {visitors.total}</Text>
              <Button 
                type="text" 
                icon={<QuestionCircleOutlined />} 
                onClick={() => setIsFirstVisit(true)}
                style={{ color: '#666', fontSize: '16px' }}
              />
            </div>
          </Header>
          
          <Content style={{ 
            margin: '16px', 
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            overflow: 'auto',
            overflowY: 'auto'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
      
      <Modal
        title=" 重要说明"
        open={isFirstVisit}
        onOk={handleFirstVisitClose}
        onCancel={handleFirstVisitClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleFirstVisitClose}>
            我知道了
          </Button>
        ]}
        width={700}
      >
        <div style={{ lineHeight: '1.8', fontSize: '14px' }}>
          <div style={{ 
            background: '#fff1f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '6px', 
            padding: '12px', 
            marginBottom: '16px' 
          }}>
            <p style={{ 
              fontWeight: 'bold', 
              color: '#f5222d', 
              marginBottom: '8px',
              fontSize: '16px'
            }}>
              侵权即删
            </p>
            <p style={{ margin: '0', color: '#666' }}>
              本系统仅用于数据展示和学习研究，切勿用于商业或违法用途，如果网站的内容侵犯了您的合法权益，请联系我们，我们将立即删除相关内容,联系邮箱s1145143104358@outlook.com
。            如有问题反馈请加群513291473进不去可以发送邮箱s1145143104358@outlook.com
            </p>
          </div>
          
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: '6px', 
            padding: '12px' 
          }}>
            <p style={{ 
              fontWeight: 'bold', 
              color: '#389e0d', 
              marginBottom: '8px',
              fontSize: '16px'
            }}>
              � 公告
            </p>
            <pre style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>
              {announcement}
            </pre>
          </div>
        </div>
      </Modal>
    </Watermark>
  );
};

export default App;
