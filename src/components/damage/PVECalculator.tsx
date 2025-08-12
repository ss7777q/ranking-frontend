import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Row, Col, Typography, Input, message, Select, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchPlayerStats, searchBoss } from '../../utils/damageCalculator';

const { Title } = Typography;
const { Option } = Select;

interface PVECalculatorProps {
  onBack: () => void;
  onUpdate?: () => void;
}

interface PlayerData {
  uid: string;
  level: number;
  hitVal: number;
  dodge: number;
  crit: number;
  tenacity: number;
  lucky: number;
  guardian: number;
  defense: number;
}

interface BossData {
  name: string;
  level: number;
  hitVal: number;
  dodge: number;
  crit: number;
  tenacity: number;
  lucky: number;
  guardian: number;
  defense: number;
}

// 六维计算函数
const calculateSixDimStats = (player: any, boss: any, sixDimStandard: any) => {
  const pStd = sixDimStandard[player.lv] || sixDimStandard[Object.keys(sixDimStandard).pop()!];
  const bStd = sixDimStandard[boss.lv] || sixDimStandard[Object.keys(sixDimStandard).pop()!];

  // 命中/闪避基础比较
  const p_p = player.hitVal / bStd - boss.dodge / pStd;

  // 暴击判定值
  const critFactor = (player.crit / bStd - boss.tenacity / pStd);

  // 暴击增伤算法
  const baseCrit = 1;
  let aCritP = player.lucky / bStd - boss.guardian / pStd;
  const critMulP = Math.max(0,Math.min(3, baseCrit + aCritP));

  // 格挡减伤算法
  const baseBlock = 1;
  let aBlockP = baseBlock + boss.guardian / pStd - player.lucky / bStd;
  aBlockP = Math.min(Math.max(0, aBlockP), 3);
  const blockRedP = aBlockP / (Math.abs(aBlockP) + 1);

  // 计算最终百分比
  const hitRateP = (p_p >= 0 ? 1 : 1 - Math.abs(p_p) / (Math.abs(p_p) + 1)) * 100;
  
  // 根据暴击判定值，决定返回暴击相关数据还是格挡相关数据
  if (critFactor > 0) {
    return {
      hitRate: hitRateP,
      critRate: Math.min(critFactor, 1) * 100,
      critMultiplier: critMulP * 100,
      blockRate: 0,
      blockReduction: 0
    };
  } else {
    const blockFactor = (boss.tenacity / pStd - player.crit / bStd);
    return {
      hitRate: hitRateP,
      critRate: 0,
      critMultiplier: 0,
      blockRate: Math.min(blockFactor, 1) * 100,
      blockReduction: blockRedP * 100
    };
  }
};

// 防御免伤计算函数
const calculateDefenseReductionRate = (def: number, lvl: number, phyDefStandard: any) => {
  const std = phyDefStandard[lvl];
  if(def>0){
    return std ? def / (def + std) * 100 : 0;
  }else{
    return (def/std)*100;
  }
};

const PVECalculator: React.FC<PVECalculatorProps> = ({ onBack, onUpdate }) => {
  const [player, setPlayer] = useState<PlayerData>({
    uid: '', level: 1, hitVal: 0, dodge: 0, crit: 0, 
    tenacity: 0, lucky: 0, guardian: 0, defense: 0
  });

  const [enemy, setEnemy] = useState<PlayerData>({
    uid: '', level: 1, hitVal: 0, dodge: 0, crit: 0, 
    tenacity: 0, lucky: 0, guardian: 0, defense: 0
  });

  const [playerBosses, setPlayerBosses] = useState<any[]>([]);
  const [enemyBosses, setEnemyBosses] = useState<any[]>([]);
  const [playerBossKeyword, setPlayerBossKeyword] = useState('');
  const [enemyBossKeyword, setEnemyBossKeyword] = useState('');
  const [selectedPlayerBoss, setSelectedPlayerBoss] = useState<string>('');
  const [selectedEnemyBoss, setSelectedEnemyBoss] = useState<string>('');

  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [loadingEnemy, setLoadingEnemy] = useState(false);
  const [result, setResult] = useState<string>('');
  const [sixDimStandard, setSixDimStandard] = useState<any>({});
  const [phyDefStandard, setPhyDefStandard] = useState<any>({});

  // 加载标准数据
  useEffect(() => {
    const loadStandards = async () => {
      try {
        const response = await fetch('/data/standards.json');
        const data = await response.json();
        setSixDimStandard(data.sixDimStandard);
        setPhyDefStandard(data.phyDefStandard);
      } catch (error) {
        console.error('加载标准数据失败:', error);
        message.error('加载配置数据失败');
      }
    };
    loadStandards();
  }, []);

  // 获取玩家属性
  const handleFetchPlayer = async () => {
    if (!player.uid.trim()) {
      message.error('请输入玩家UID');
      return;
    }

    setLoadingPlayer(true);
    try {
      const data = await fetchPlayerStats(player.uid);
      setPlayer(prev => ({
        ...prev,
        level: data.lv || 1,
        hitVal: data.hitVal || 0,
        dodge: data.dodge || 0,
        crit: data.crit || 0,
        tenacity: data.tenacity || 0,
        lucky: data.lucky || 0,
        guardian: data.guardian || 0,
        defense: data.def || 0
      }));
      message.success('获取成功');
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('未找到') || msg.includes('未找到玩家数据')) {
        message.warning('请先使用角色属性更新加入自己的属性');
      } else {
        message.error('获取失败，请检查UID格式');
      }
    } finally {
      setLoadingPlayer(false);
    }
  };

  // 获取敌人属性
  const handleFetchEnemy = async () => {
    if (!enemy.uid.trim()) {
      message.error('请输入敌人UID');
      return;
    }

    setLoadingEnemy(true);
    try {
      const data = await fetchPlayerStats(enemy.uid);
      setEnemy(prev => ({
        ...prev,
        level: data.lv || 1,
        hitVal: data.hitVal || 0,
        dodge: data.dodge || 0,
        crit: data.crit || 0,
        tenacity: data.tenacity || 0,
        lucky: data.lucky || 0,
        guardian: data.guardian || 0,
        defense: data.def || 0
      }));
      message.success('获取成功');
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('未找到')) {
        message.error('请先使用角色属性更新加入自己的属性');
      } else {
        message.error('获取失败，请检查UID格式');
      }
    } finally {
      setLoadingEnemy(false);
    }
  };

  // 搜索BOSS
  const handleSearchPlayerBoss = async () => {
    if (!playerBossKeyword.trim()) {
      message.error('请输入BOSS关键字');
      return;
    }

    try {
      const bosses = await searchBoss(playerBossKeyword);
      setPlayerBosses(bosses);
      if (bosses.length === 0) {
        message.info('未找到匹配的BOSS');
      } else {
        message.success(`找到 ${bosses.length} 个BOSS`);
      }
    } catch (error) {
      message.error('搜索失败');
    }
  };

  const handleSearchEnemyBoss = async () => {
    if (!enemyBossKeyword.trim()) {
      message.error('请输入BOSS关键字');
      return;
    }

    try {
      const bosses = await searchBoss(enemyBossKeyword);
      setEnemyBosses(bosses);
      if (bosses.length === 0) {
        message.info('未找到匹配的BOSS');
      } else {
        message.success(`找到 ${bosses.length} 个BOSS`);
      }
    } catch (error) {
      message.error('搜索失败');
    }
  };

  // 填充BOSS数据
  const handleFillPlayerBoss = () => {
    if (!selectedPlayerBoss) {
      message.error('请先选择一个BOSS');
      return;
    }

    const boss = playerBosses.find((b, idx) => idx.toString() === selectedPlayerBoss);
    if (boss) {
      setPlayer(prev => ({
        ...prev,
        level: boss.lv || 0,
        hitVal: boss.hitVal || 0,
        dodge: boss.dodge || 0,
        crit: boss.crit || 0,
        tenacity: boss.tenacity || 0,
        lucky: boss.lucky || 0,
        guardian: boss.guardian || 0,
        defense: boss.def || boss.defense || 0
      }));
      message.success('BOSS数据填充成功');
    }
  };

  const handleFillEnemyBoss = () => {
    if (!selectedEnemyBoss) {
      message.error('请先选择一个BOSS');
      return;
    }

    const boss = enemyBosses.find((b, idx) => idx.toString() === selectedEnemyBoss);
    if (boss) {
      setEnemy(prev => ({
        ...prev,
        level: boss.lv || 0,
        hitVal: boss.hitVal || 0,
        dodge: boss.dodge || 0,
        crit: boss.crit || 0,
        tenacity: boss.tenacity || 0,
        lucky: boss.lucky || 0,
        guardian: boss.guardian || 0,
        defense: boss.def || boss.defense || 0
      }));
      message.success('BOSS数据填充成功');
    }
  };

  // 计算结果
  const handleCalculate = () => {
    if (!player.level || !enemy.level) {
      message.error('请先输入双方等级');
      return;
    }

    try {
      // 转换数据格式
      const playerStats = {
        lv: player.level,
        hitVal: player.hitVal,
        dodge: player.dodge,
        crit: player.crit,
        tenacity: player.tenacity,
        lucky: player.lucky,
        guardian: player.guardian,
        defense: player.defense
      };

      const enemyStats = {
        lv: enemy.level,
        hitVal: enemy.hitVal,
        dodge: enemy.dodge,
        crit: enemy.crit,
        tenacity: enemy.tenacity,
        lucky: enemy.lucky,
        guardian: enemy.guardian,
        defense: enemy.defense
      };

      // 计算六维结果 (双向)
      const playerVsEnemy = calculateSixDimStats(playerStats, enemyStats, sixDimStandard);
      const enemyVsPlayer = calculateSixDimStats(enemyStats, playerStats, sixDimStandard);

      // 计算防御免伤率 (双向)
      const defRatePlayer = calculateDefenseReductionRate(playerStats.defense, enemyStats.lv, phyDefStandard);
      const defRateEnemy = calculateDefenseReductionRate(enemyStats.defense, playerStats.lv, phyDefStandard);

      // 格式化结果
      const resultText = `我方对敌人六维结果:
命中率: ${playerVsEnemy.hitRate.toFixed(2)}%
${playerVsEnemy.critRate > 0 ? 
  `暴击率: ${playerVsEnemy.critRate.toFixed(2)}%
暴击增伤率: ${playerVsEnemy.critMultiplier.toFixed(2)}%` :
  `格挡率: ${playerVsEnemy.blockRate.toFixed(2)}%
格挡免伤率: ${playerVsEnemy.blockReduction.toFixed(2)}%`
}

敌人对我方六维结果:
命中率: ${enemyVsPlayer.hitRate.toFixed(2)}%
${enemyVsPlayer.critRate > 0 ? 
  `暴击率: ${enemyVsPlayer.critRate.toFixed(2)}%
暴击增伤率: ${enemyVsPlayer.critMultiplier.toFixed(2)}%` :
  `格挡率: ${enemyVsPlayer.blockRate.toFixed(2)}%
格挡免伤率: ${enemyVsPlayer.blockReduction.toFixed(2)}%`
}

防御免伤率:
我方免伤率: ${defRatePlayer.toFixed(2)}%
敌人免伤率: ${defRateEnemy.toFixed(2)}%`;

      setResult(resultText);
    } catch (error) {
      message.error('计算失败，请检查输入数据');
      console.error('PVE计算错误:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={onBack} 
        style={{ marginBottom: '20px' }}
      >
        返回
      </Button>
      
      <Title level={2}>六维 & 防御免伤 计算器</Title>
      
      <Row gutter={24}>
        <Col span={12}>
          <Card title="玩家属性" style={{ marginBottom: '20px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={16}>
                <Input 
                  placeholder="输入UID" 
                  value={player.uid}
                  onChange={(e) => setPlayer(prev => ({ ...prev, uid: e.target.value }))}
                />
              </Col>
              <Col span={8}>
                <Button 
                  type="primary" 
                  loading={loadingPlayer} 
                  onClick={handleFetchPlayer}
                  block
                >
                  获取属性
                </Button>
              </Col>
            </Row>

            {/* BOSS搜索区域 - 手机端两列一行(16/8)，桌面端维持原 8/6/6/4 */}
            <Row gutter={8} style={{ marginBottom: '16px' }}>
              <Col xs={16} sm={12} md={8}>
                <Input 
                  placeholder="BOSS关键字" 
                  value={playerBossKeyword}
                  onChange={(e) => setPlayerBossKeyword(e.target.value)}
                />
              </Col>
              <Col xs={8} sm={6} md={6}>
                <Button onClick={handleSearchPlayerBoss} block>搜索BOSS</Button>
              </Col>
              <Col xs={16} sm={12} md={6}>
                <Select 
                  placeholder="选择BOSS"
                  value={selectedPlayerBoss}
                  onChange={setSelectedPlayerBoss}
                  style={{ width: '100%' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: 240 }}
                  optionLabelProp="title"
                >
                  {playerBosses.map((boss, idx) => {
                    const label = boss.name ? (boss.remark ? `${boss.name} - ${boss.remark}` : boss.name) : `BOSS${idx + 1}`;
                    return (
                      <Option key={idx} value={idx.toString()} title={label}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col xs={8} sm={6} md={4}>
                <Button onClick={handleFillPlayerBoss} block>填充</Button>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>等级</div>
                <InputNumber 
                  min={1} 
                  value={player.level} 
                  onChange={(val) => setPlayer(prev => ({ ...prev, level: val || 1 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>命中</div>
                <InputNumber 
                  value={player.hitVal}
                  onChange={(val) => setPlayer(prev => ({ ...prev, hitVal: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>闪避</div>
                <InputNumber 
                  value={player.dodge}
                  onChange={(val) => setPlayer(prev => ({ ...prev, dodge: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>暴击</div>
                <InputNumber 
                  value={player.crit}
                  onChange={(val) => setPlayer(prev => ({ ...prev, crit: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>韧性</div>
                <InputNumber 
                  value={player.tenacity}
                  onChange={(val) => setPlayer(prev => ({ ...prev, tenacity: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>幸运</div>
                <InputNumber 
                  value={player.lucky}
                  onChange={(val) => setPlayer(prev => ({ ...prev, lucky: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守护</div>
                <InputNumber 
                  value={player.guardian}
                  onChange={(val) => setPlayer(prev => ({ ...prev, guardian: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>防御</div>
                <InputNumber 
                  value={player.defense}
                  onChange={(val) => setPlayer(prev => ({ ...prev, defense: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="敌人属性" style={{ marginBottom: '20px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={16}>
                <Input 
                  placeholder="输入UID" 
                  value={enemy.uid}
                  onChange={(e) => setEnemy(prev => ({ ...prev, uid: e.target.value }))}
                />
              </Col>
              <Col span={8}>
                <Button 
                  type="primary" 
                  loading={loadingEnemy} 
                  onClick={handleFetchEnemy}
                  block
                >
                  获取属性
                </Button>
              </Col>
            </Row>

            {/* BOSS搜索区域 - 手机端两列一行(16/8)，桌面端维持原 8/6/6/4 */}
            <Row gutter={8} style={{ marginBottom: '16px' }}>
              <Col xs={16} sm={12} md={8}>
                <Input 
                  placeholder="BOSS关键字" 
                  value={enemyBossKeyword}
                  onChange={(e) => setEnemyBossKeyword(e.target.value)}
                />
              </Col>
              <Col xs={8} sm={6} md={6}>
                <Button onClick={handleSearchEnemyBoss} block>搜索BOSS</Button>
              </Col>
              <Col xs={16} sm={12} md={6}>
                <Select 
                  placeholder="选择BOSS"
                  value={selectedEnemyBoss}
                  onChange={setSelectedEnemyBoss}
                  style={{ width: '100%' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: 240 }}
                  optionLabelProp="title"
                >
                  {enemyBosses.map((boss, idx) => {
                    const labelE = boss.name || boss.remark ? (boss.name && boss.remark ? `${boss.name} - ${boss.remark}` : boss.name || boss.remark) : `BOSS${idx + 1}`;
                    return (
                      <Option key={idx} value={idx.toString()} title={labelE}>
                        {labelE}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col xs={8} sm={6} md={4}>
                <Button onClick={handleFillEnemyBoss} block>填充</Button>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>等级</div>
                <InputNumber 
                  min={1} 
                  value={enemy.level} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, level: val || 1 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>命中</div>
                <InputNumber 
                  value={enemy.hitVal} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, hitVal: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>闪避</div>
                <InputNumber 
                  value={enemy.dodge} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, dodge: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>暴击</div>
                <InputNumber 
                  value={enemy.crit} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, crit: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>韧性</div>
                <InputNumber 
                  value={enemy.tenacity} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, tenacity: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>幸运</div>
                <InputNumber 
                  value={enemy.lucky} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, lucky: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守护</div>
                <InputNumber 
                  value={enemy.guardian} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, guardian: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>防御</div>
                <InputNumber 
                  value={enemy.defense} 
                  onChange={(val) => setEnemy(prev => ({ ...prev, defense: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button type="primary" size="large" onClick={handleCalculate}>
          计算结果
        </Button>
        <Button style={{ marginLeft: 12 }} size="large" onClick={onUpdate || onBack}>
          更新角色属性
        </Button>
        <Button style={{ marginLeft: 12 }} size="large" href="https://my.4399.com/forums/thread-64025366" target="_blank">
          理论介绍：属性如何决定伤害
        </Button>
      </div>
      
      {result && (
        <Card title="计算结果">
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {result}
          </pre>
        </Card>
      )}

    </div>
  );
};

export default PVECalculator;
