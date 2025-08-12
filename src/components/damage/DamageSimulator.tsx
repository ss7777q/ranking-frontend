import React from 'react';
import { Tabs } from 'antd';
import PVECalculator from './PVECalculator';
import PVPCalculator from './PVPCalculator';
import CharacterUpdate from './CharacterUpdate';

const { TabPane } = Tabs;

const DamageSimulator: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Tabs defaultActiveKey="pve" size="large">
        <TabPane tab="PVE伤害计算" key="pve">
          <PVECalculator onBack={() => {}} />
        </TabPane>
        <TabPane tab="PVP伤害计算" key="pvp">
          <PVPCalculator onBack={() => {}} />
        </TabPane>
        <TabPane tab="属性更新" key="update">
          <CharacterUpdate onBack={() => {}} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DamageSimulator;
