import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Input, Button, Row, Col, Typography, Divider, message } from 'antd';
import { CalculatorOutlined, UserOutlined, SearchOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { AppSettings } from '../types';
import { systemPowerAPI } from '../services/api';
import ApiResponseHandler from '../utils/apiResponseHandler';

const { Option } = Select;
const { Title, Text } = Typography;

interface DamageCalculatorProps {
  settings: AppSettings;
}

interface PlayerStats {
  uid: string;
  level: number;
  hitVal: number;
  dodge: number;
  crit: number;
  tenacity: number;
  lucky: number;
  guardian: number;
  defense: number;
  atk?: number;
  hp?: number;
  mp?: number;
}

interface BossData {
  id: string;
  name: string;
  level: number;
  stats: Partial<PlayerStats>;
}

const DamageCalculator: React.FC<DamageCalculatorProps> = ({ settings }) => {
  const [calculatorMode, setCalculatorMode] = useState<'pve' | 'pvp'>('pve');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    uid: '',
    level: 1,
    hitVal: 0,
    dodge: 0,
    crit: 0,
    tenacity: 0,
    lucky: 0,
    guardian: 0,
    defense: 0
  });
  
  const [enemyStats, setEnemyStats] = useState<PlayerStats>({
    uid: '',
    level: 1,
    hitVal: 0,
    dodge: 0,
    crit: 0,
    tenacity: 0,
    lucky: 0,
    guardian: 0,
    defense: 0
  });

  const [bossKeyword, setBossKeyword] = useState('');
  const [bossList, setBossList] = useState<BossData[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // 标准数据 - 从原项目的standards.json移植
  const [standards, setStandards] = useState<{
    sixDimStandard: Record<string, number>;
    phyDefStandard: Record<string, number>;
  }>({
    sixDimStandard: {},
    phyDefStandard: {}
  });

  useEffect(() => {
    // 加载标准数据 - 这里可以从API获取或直接内嵌
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      // 这里应该从你的后端API获取，或者直接内嵌数据
      const response = await fetch('/standards.json');
      const data = await response.json();
      setStandards(data);
    } catch (error) {
      console.error('加载标准数据失败:', error);
      // 使用内嵌的部分数据作为fallback
      setStandards({
        sixDimStandard: { '1': 2520, '50': 5442.9, '100': 4480.0 },
        phyDefStandard: { '1': 18.0, '50': 1412.3, '100': 4480.0 }
      });
    }
  };

  // 从原script.js移植的核心计算函数
  const calculateSixDimEffects = (player: PlayerStats, enemy: PlayerStats) => {
    const playerLevel = player.level;
    const enemyLevel = enemy.level;
    
    // 六维计算逻辑（从原项目移植）
    const playerStandard = standards.sixDimStandard[playerLevel.toString()] || 2520;
    const enemyStandard = standards.sixDimStandard[enemyLevel.toString()] || 2520;
    
    // 命中率计算
    const hitRate = Math.min(0.95, Math.max(0.05, 
      0.5 + (player.hitVal - enemy.dodge) / (playerStandard + enemyStandard)
    ));
    
    // 暴击率计算
    const critRate = Math.min(0.95, Math.max(0.05,
      0.05 + (player.crit - enemy.tenacity) / (playerStandard + enemyStandard)
    ));
    
    // 幸运率计算（格挡率）
    const blockRate = Math.min(0.95, Math.max(0.05,
      0.05 + (enemy.lucky - player.guardian) / (playerStandard + enemyStandard)
    ));

    return {
      hitRate: Math.round(hitRate * 10000) / 100,
      critRate: Math.round(critRate * 10000) / 100,
      blockRate: Math.round(blockRate * 10000) / 100
    };
  };

  const calculateDefenseReduction = (attackerLevel: number, defenderDefense: number) => {
    const defStandard = standards.phyDefStandard[attackerLevel.toString()] || 100;
    const reduction = defenderDefense / (defenderDefense + defStandard);
    return Math.round(reduction * 10000) / 100;
  };

  const fetchPlayerStats = async (type: 'player' | 'enemy') => {
    const stats = type === 'player' ? playerStats : enemyStats;
    const setStats = type === 'player' ? setPlayerStats : setEnemyStats;
    
    if (!stats.uid.trim()) {
      message.warning('请输入UID');
      return;
    }

    setLoading(true);
    try {
      // 使用新的API服务
      const response = await systemPowerAPI.getCharacterDetails(stats.uid);
      const data = ApiResponseHandler.handleResponse(response);
      
      if (data) {
        setStats(prev => ({
          ...prev,
          level: data.lv || prev.level,
          hitVal: data.hitVal || 0,
          dodge: data.dodge || 0,
          crit: data.crit || 0,
          tenacity: data.tenacity || 0,
          lucky: data.lucky || 0,
          guardian: data.guardian || 0,
          defense: data.def || 0,
          atk: data.atk || 0,
          hp: data.hp || 0,
          mp: data.mp || 0
        }));
        message.success('属性获取成功');
      }
    } catch (error) {
      console.error('获取属性失败:', error);
      // ApiResponseHandler.handleResponse 已经处理了错误显示
    } finally {
      setLoading(false);
    }
  };

  const searchBoss = async () => {
    if (!bossKeyword.trim()) {
      message.warning('请输入BOSS关键字');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://zmwsapi.118qq.top/api/getMonster?keywords=${encodeURIComponent(bossKeyword)}&computer=1&_t=${Date.now()}`
      );
      const result = await response.json();
      
      if (result.code === 200 && result.data.data.length > 0) {
        const bosses = result.data.data.map((boss: any) => ({
          id: boss.id,
          name: boss.name,
          level: boss.lv || 1,
          stats: {
            hitVal: boss.hitVal || 0,
            dodge: boss.dodge || 0,
            crit: boss.crit || 0,
            tenacity: boss.tenacity || 0,
            lucky: boss.lucky || 0,
            guardian: boss.guardian || 0,
            defense: boss.def || 0
          }
        }));
        setBossList(bosses);
        message.success(`找到 ${bosses.length} 个BOSS`);
      } else {
        message.error('未找到匹配的BOSS');
        setBossList([]);
      }
    } catch (error) {
      console.error('搜索BOSS失败:', error);
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const scrollToStats = () => {
    statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterPVE = () => {
    setCalculatorMode('pve');
    scrollToStats();
  };

  const handleEnterPVP = () => {
    setCalculatorMode('pvp');
    scrollToStats();
  };

  const handleUpdateAttributes = async () => {
    if (!playerStats.uid && !enemyStats.uid) {
      message.warning('请先在上方输入至少一个 UID');
      return;
    }
    await fetchPlayerStats('player');
    await fetchPlayerStats('enemy');
  };

  const populateBossStats = () => {
    const boss = bossList.find(b => b.id === selectedBoss);
    if (!boss) return;

    setEnemyStats(prev => ({
      ...prev,
      level: boss.level,
      ...boss.stats
    }));
    message.success(`已填充${boss.name}的属性`);
  };

  const calculate = () => {
    if (calculatorMode === 'pve') {
      const effects = calculateSixDimEffects(playerStats, enemyStats);
      const defReduction = calculateDefenseReduction(playerStats.level, enemyStats.defense);
      
      setResult(`
        <div style="padding: 16px;">
          <h3>PVE 计算结果</h3>
          <p><strong>命中率:</strong> ${effects.hitRate}%</p>
          <p><strong>暴击率:</strong> ${effects.critRate}%</p>
          <p><strong>敌方格挡率:</strong> ${effects.blockRate}%</p>
          <p><strong>防御减伤:</strong> ${defReduction}%</p>
          <hr />
          <p><em>基于等级 ${playerStats.level} vs ${enemyStats.level} 的标准值计算</em></p>
        </div>
      `);
    } else {
      // PVP计算逻辑
      const p1Effects = calculateSixDimEffects(playerStats, enemyStats);
      const p2Effects = calculateSixDimEffects(enemyStats, playerStats);
      
      setResult(`
        <div style="padding: 16px;">
          <h3>PVP 计算结果</h3>
          <h4>玩家1 → 玩家2:</h4>
          <p>命中率: ${p1Effects.hitRate}% | 暴击率: ${p1Effects.critRate}%</p>
          <h4>玩家2 → 玩家1:</h4>
          <p>命中率: ${p2Effects.hitRate}% | 暴击率: ${p2Effects.critRate}%</p>
        </div>
      `);
    }
  };

  const renderStatsInputs = (stats: PlayerStats, setStats: React.Dispatch<React.SetStateAction<PlayerStats>>, type: 'player' | 'enemy') => (
    <Card title={type === 'player' ? '玩家属性' : '敌人属性'} size="small">
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12}>
          <Text>UID:</Text>
          <Input 
            value={stats.uid}
            onChange={e => setStats(prev => ({ ...prev, uid: e.target.value }))}
            placeholder="输入UID"
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text>等级:</Text>
          <Input 
            type="number"
            value={stats.level}
            onChange={e => setStats(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>命中:</Text>
          <Input 
            type="number"
            value={stats.hitVal}
            onChange={e => setStats(prev => ({ ...prev, hitVal: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>闪避:</Text>
          <Input 
            type="number"
            value={stats.dodge}
            onChange={e => setStats(prev => ({ ...prev, dodge: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>暴击:</Text>
          <Input 
            type="number"
            value={stats.crit}
            onChange={e => setStats(prev => ({ ...prev, crit: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>韧性:</Text>
          <Input 
            type="number"
            value={stats.tenacity}
            onChange={e => setStats(prev => ({ ...prev, tenacity: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>幸运:</Text>
          <Input 
            type="number"
            value={stats.lucky}
            onChange={e => setStats(prev => ({ ...prev, lucky: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>守护:</Text>
          <Input 
            type="number"
            value={stats.guardian}
            onChange={e => setStats(prev => ({ ...prev, guardian: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <Text>防御:</Text>
          <Input 
            type="number"
            value={stats.defense}
            onChange={e => setStats(prev => ({ ...prev, defense: parseInt(e.target.value) || 0 }))}
            style={{ marginTop: 4 }}
          />
        </Col>
        <Col xs={12} sm={12}>
          <div style={{ marginTop: 4 }}>
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              loading={loading}
              onClick={() => fetchPlayerStats(type)}
              block
            >
              获取属性
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="damage-calculator">
      <Card>
        <Title level={4}>六维模拟计算器</Title>
        {/* 入口按钮：位于标题下方，独立于说明文字 */}
        <Row gutter={[8, 8]} className="mode-buttons" style={{ marginBottom: 12 }}>
          <Col xs={8} sm={8} md={6} lg={6}>
            <Button block icon={<PlayCircleOutlined />} onClick={handleEnterPVE}>
              进入 PVE
            </Button>
          </Col>
          <Col xs={8} sm={8} md={6} lg={6}>
            <Button block icon={<UserOutlined />} onClick={handleEnterPVP}>
              进入 PVP
            </Button>
          </Col>
          <Col xs={8} sm={8} md={6} lg={6}>
            <Button block icon={<ReloadOutlined />} onClick={handleUpdateAttributes}>
              更新属性
            </Button>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Button 
              type="primary" 
              icon={<CalculatorOutlined />}
              onClick={calculate}
              block
            >
              计算结果
            </Button>
          </Col>
        </Row>

        {/* 计算模式选择（可选） */}
        <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12}>
            <Text strong>计算模式:</Text>
            <Select
              value={calculatorMode}
              onChange={setCalculatorMode}
              style={{ width: '100%', marginTop: 8 }}
              options={[
                { value: 'pve', label: 'PVE (六维 & 防御免伤)' },
                { value: 'pvp', label: 'PVP (玩家对战)' }
              ]}
            />
          </Col>
        </Row>

        <Row gutter={[8, 8]} className="stats-input" ref={statsSectionRef}>
          <Col xs={24} lg={12}>
            {renderStatsInputs(playerStats, setPlayerStats, 'player')}
          </Col>
          <Col xs={24} lg={12}>
            {renderStatsInputs(enemyStats, setEnemyStats, 'enemy')}
          </Col>
        </Row>

        {calculatorMode === 'pve' && (
          <Card title="BOSS搜索" size="small" style={{ marginTop: 16 }}>
            <Row gutter={[8, 8]} className="boss-search" align="bottom">
              {/* BOSS 名称 + 搜索（手机端两列一行：16/8） */}
              <Col xs={16} sm={12} md={10}>
                <Text>BO32SS关键字:</Text>
                <Input
                  value={bossKeyword}
                  onChange={e => setBossKeyword(e.target.value)}
                  placeholder="输入BOSS关键字"
                  style={{ marginTop: 4 }}
                />
              </Col>
              <Col xs={8} sm={6} md={4}>
                <Button 
                  icon={<SearchOutlined />}
                  onClick={searchBoss}
                  loading={loading}
                  block
                >
                  搜索
                </Button>
              </Col>
              {/* 选择 + 填充（手机端两列一行：16/8） */}
              <Col xs={16} sm={12} md={10}>
                <Text>选择BOSS:</Text>
                <Select
                  value={selectedBoss}
                  onChange={setSelectedBoss}
                  placeholder="选择BOSS"
                  style={{ width: '100%', marginTop: 4 }}
                >
                  {bossList.map(boss => (
                    <Option key={boss.id} value={boss.id}>
                      {boss.name} (Lv.{boss.level})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={8} sm={6} md={4}>
                <Button onClick={populateBossStats} disabled={!selectedBoss} block>
                  填充属性
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        <Divider />

        <Card title="计算结果" size="small" className="result-card">
          {result ? (
            <div dangerouslySetInnerHTML={{ __html: result }} />
          ) : (
            <Text type="secondary">请先填入属性数据，然后点击"计算结果"</Text>
          )}
        </Card>
      </Card>
    </div>
  );
};

export default DamageCalculator;
