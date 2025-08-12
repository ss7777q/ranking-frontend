import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, Divider } from 'antd';
import { PlayCircleOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import PVECalculator from './damage/PVECalculator';
import PVPCalculator from './damage/PVPCalculator';
import CharacterUpdate from './damage/CharacterUpdate';

const { Title, Text } = Typography;

interface DamageSimulatorProps {
  settings: any;
}

type ViewMode = 'home' | 'pve' | 'pvp' | 'update';

const DamageSimulator: React.FC<DamageSimulatorProps> = ({ settings }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  const renderHome = () => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Title level={2}>游戏模式选择</Title>
      <Row gutter={[32, 32]} justify="center" style={{ marginTop: 40 }}>
        <Col span={6}>
          <Card 
            hoverable
            style={{ height: 200 }}
            onClick={() => setCurrentView('pve')}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <PlayCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={4}>PVE 对战</Title>
              <Text type="secondary">六维 & 防御免伤计算</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            hoverable
            style={{ height: 200 }}
            onClick={() => setCurrentView('pvp')}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <UserOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>PVP 对战</Title>
              <Text type="secondary">玩家 vs 玩家计算</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            hoverable
            style={{ height: 200 }}
            onClick={() => setCurrentView('update')}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <SettingOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
              <Title level={4}>角色属性更新</Title>
              <Text type="secondary">从服务器更新角色详情</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 入口按钮行：摆放在卡片下方，脱离卡片内容 */}
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: 16 }}>
        <Col span={6} xs={24} sm={12} md={8} lg={6}>
          <Button type="primary" size="large" block onClick={() => setCurrentView('pve')}>
            进入 PVE
          </Button>
        </Col>
        <Col span={6} xs={24} sm={12} md={8} lg={6}>
          <Button type="primary" size="large" block onClick={() => setCurrentView('pvp')}>
            进入 PVP
          </Button>
        </Col>
        <Col span={6} xs={24} sm={12} md={8} lg={6}>
          <Button size="large" block onClick={() => setCurrentView('update')}>
            更新属性
          </Button>
        </Col>
      </Row>
      
      <Divider style={{ margin: '40px 0' }} />
      
      <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
        <Title level={4}>使用说明</Title>
        <Text>
          <strong>暴击增伤率与格挡免伤率的解释：</strong>
          <br /><br />
          假设原始伤害为 A，则暴击伤害 = A × (1 + 暴击增伤率)
          <br /><br />
          格挡伤害 = A × (1 - 格挡免伤率)
        </Text>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'pve':
        return <PVECalculator onBack={() => setCurrentView('home')} onUpdate={() => setCurrentView('update')} />;
      case 'pvp':
        return <PVPCalculator onBack={() => setCurrentView('home')} onUpdate={() => setCurrentView('update')} />;
      case 'update':
        return <CharacterUpdate onBack={() => setCurrentView('home')} />;
      default:
        return renderHome();
    }
  };

  return (
    <Card>
      <Title level={3}>六维计算器</Title>
      {renderContent()}
    </Card>
  );
};

export default DamageSimulator;
