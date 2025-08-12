import React, { useState } from 'react';
import { Card, InputNumber, Button, Row, Col, Typography, Input, message, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchPlayerStats } from '../../utils/damageCalculator';

const { Title } = Typography;

interface PVPCalculatorProps {
  onBack: () => void;
  onUpdate?: () => void;
}

interface PlayerData {
  // UID和基础属性
  uid: string;
  level: number;
  atk: number;
  def: number;
  hp: number;
  mp: number;
  hitVal: number;
  dodge: number;
  crit: number;
  tenacity: number;
  lucky: number;
  guardian: number;
  break: number;
  protect: number;
  // PVP特有属性
  defP: number;      // 守御
  defSubtractP: number; // 破防
  hitValP: number;   // 专注
  dodgeP: number;    // 灵动
  critP: number;     // 会心
  tenacityP: number; // 化劲
  luckyP: number;    // 致命
  guardianP: number; // 御劲
}

// 六维计算函数 (从原始JS逻辑复制)
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
  aCritP = Math.max(0, aCritP);
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
    // 发生暴击
    return {
      hitRate: hitRateP,
      critRate: Math.min(critFactor, 1) * 100,
      critMultiplier: critMulP * 100,
      blockRate: 0,
      blockReduction: 0
    };
  } else {
    // 发生格挡
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

const PVPCalculator: React.FC<PVPCalculatorProps> = ({ onBack, onUpdate }) => {
  const [player1, setPlayer1] = useState<PlayerData>({
    uid: '', level: 1, atk: 0, def: 0, hp: 0, mp: 0,
    hitVal: 0, dodge: 0, crit: 0, tenacity: 0, lucky: 0, guardian: 0,
    break: 0, protect: 0, defP: 0, defSubtractP: 0, hitValP: 0,
    dodgeP: 0, critP: 0, tenacityP: 0, luckyP: 0, guardianP: 0
  });

  const [player2, setPlayer2] = useState<PlayerData>({
    uid: '', level: 1, atk: 0, def: 0, hp: 0, mp: 0,
    hitVal: 0, dodge: 0, crit: 0, tenacity: 0, lucky: 0, guardian: 0,
    break: 0, protect: 0, defP: 0, defSubtractP: 0, hitValP: 0,
    dodgeP: 0, critP: 0, tenacityP: 0, luckyP: 0, guardianP: 0
  });

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [result, setResult] = useState<string>('');
  const [sixDimStandard, setSixDimStandard] = useState<any>({});
  const [phyDefStandard, setPhyDefStandard] = useState<any>({});

  // 加载标准数据
  React.useEffect(() => {
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

  // 将PVP属性转换为等效的常规属性
  const convertToEffectiveStats = (player: PlayerData) => {
    // 基础属性
    const base = {
      lv: player.level,
      hitVal: player.hitVal,
      dodge: player.dodge,
      crit: player.crit,
      tenacity: player.tenacity,
      lucky: player.lucky,
      guardian: player.guardian,
      defense: player.def
    };
    
    // PVP属性 (1P = 4常规属性)
    const pvpStats = {
      hitVal: player.hitValP * 4,
      dodge: player.dodgeP * 4,
      crit: player.critP * 4,
      tenacity: player.tenacityP * 4,
      lucky: player.luckyP * 4,
      guardian: player.guardianP * 4,
      defense: 0
    };
    
    // 处理守御和破防的特殊逻辑
    const defP = player.defP;
    const defSubtractP = player.defSubtractP;
    
    // 守御先抵消破防，剩余按2/3比例转换为防御
    let effectiveDefP = defP - defSubtractP;
    if (effectiveDefP > 0) {
      pvpStats.defense = effectiveDefP * (2/3);
    }
    
    // 合并基础属性和PVP等效属性
    return {
      lv: base.lv,
      hitVal: base.hitVal + pvpStats.hitVal,
      dodge: base.dodge + pvpStats.dodge,
      crit: base.crit + pvpStats.crit,
      tenacity: base.tenacity + pvpStats.tenacity,
      lucky: base.lucky + pvpStats.lucky,
      guardian: base.guardian + pvpStats.guardian,
      defense: base.defense + pvpStats.defense
    };
  };

const handleFetchPlayer1 = async () => {
    if (!player1.uid.trim()) {
      message.error('请输入玩家一的UID');
      return;
    }

    setLoading1(true);
    try {
      const data = await fetchPlayerStats(player1.uid);
      setPlayer1(prev => ({
        ...prev,
        level: data.lv || 1,
        atk: data.atk || 0,
        def: data.def || 0,
        hp: data.hp || 0,
        mp: data.mp || 0,
        hitVal: data.hitVal || 0,
        dodge: data.dodge || 0,
        crit: data.crit || 0,
        tenacity: data.tenacity || 0,
        lucky: data.lucky || 0,
        guardian: data.guardian || 0,
        break: data.break || 0,
        protect: data.protect || 0
      }));
      message.success('获取成功');
    } catch (error) {
      const msg = (error as any).message || '';
      if (msg.includes('未找到')) {
        message.warning('请先使用角色属性更新加入自己的属性');
      } else {
        message.error('获取失败，请检查UID格式');
      }
    } finally {
      setLoading1(false);
    }
  };

  const handleFetchPlayer2 = async () => {
    if (!player2.uid.trim()) {
      message.error('请输入玩家二的UID');
      return;
    }

    setLoading2(true);
    try {
      const data = await fetchPlayerStats(player2.uid);
      setPlayer2(prev => ({
        ...prev,
        level: data.lv || 1,
        atk: data.atk || 0,
        def: data.def || 0,
        hp: data.hp || 0,
        mp: data.mp || 0,
        hitVal: data.hitVal || 0,
        dodge: data.dodge || 0,
        crit: data.crit || 0,
        tenacity: data.tenacity || 0,
        lucky: data.lucky || 0,
        guardian: data.guardian || 0,
        break: data.break || 0,
        protect: data.protect || 0
      }));
      message.success('获取成功');
    } catch (error) {
      const msg = (error as any).message || '';
      if (msg.includes('未找到')) {
        message.warning('请先使用角色属性更新加入自己的属性');
      } else {
        message.error('获取失败，请检查UID格式');
      }
    } finally {
      setLoading2(false);
    }
  };

  const handleCalculate = () => {
    // 验证基本数据 - 注意这里不强制要求获取数据，可以手动输入
    if (!player1.level || !player2.level) {
      message.error('请先输入双方玩家等级');
      return;
    }

    try {
      // 转换为等效属性
      const p1 = convertToEffectiveStats(player1);
      const p2 = convertToEffectiveStats(player2);

      // 使用本地函数进行计算
      const result1vs2 = calculateSixDimStats(p1, p2, sixDimStandard);
      const result2vs1 = calculateSixDimStats(p2, p1, sixDimStandard);
      
      const defRate1 = calculateDefenseReductionRate(p2.defense, p1.lv, phyDefStandard);
      const defRate2 = calculateDefenseReductionRate(p1.defense, p2.lv, phyDefStandard);

      // 格式化结果显示
      const resultText = `玩家1 对 玩家2 六维结果:
命中率: ${result1vs2.hitRate.toFixed(2)}%
${result1vs2.critRate > 0 ? 
  `暴击率: ${result1vs2.critRate.toFixed(2)}%
暴击增伤率: ${result1vs2.critMultiplier.toFixed(2)}%` :
  `格挡率: ${result1vs2.blockRate.toFixed(2)}%
格挡免伤率: ${result1vs2.blockReduction.toFixed(2)}%`
}

玩家2 对 玩家1 六维结果:
命中率: ${result2vs1.hitRate.toFixed(2)}%
${result2vs1.critRate > 0 ? 
  `暴击率: ${result2vs1.critRate.toFixed(2)}%
暴击增伤率: ${result2vs1.critMultiplier.toFixed(2)}%` :
  `格挡率: ${result2vs1.blockRate.toFixed(2)}%
格挡免伤率: ${result2vs1.blockReduction.toFixed(2)}%`
}

防御免伤率:
玩家1免伤率: ${defRate2.toFixed(2)}%
玩家2免伤率: ${defRate1.toFixed(2)}%`;

      setResult(resultText);
    } catch (error) {
      message.error('计算失败，请检查输入数据');
      console.error('PVP计算错误:', error);
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
      
      <Title level={2}>PVP 对战计算器</Title>
      
      <Row gutter={24}>
        <Col span={12}>
          <Card title="玩家一属性" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Input 
                  placeholder="输入UID" 
                  value={player1.uid}
                  onChange={(e) => setPlayer1(prev => ({ ...prev, uid: e.target.value }))}
                />
              </Col>
              <Col span={8}>
                <Button 
                  type="primary" 
                  loading={loading1} 
                  onClick={handleFetchPlayer1}
                  block
                >
                  获取属性
                </Button>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>等级</div>
                <InputNumber 
                  min={1} 
                  value={player1.level} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, level: val || 1 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>攻击</div>
              <InputNumber 
                value={player1.atk} 
                onChange={(val) => setPlayer1(prev => ({ ...prev, atk: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>防御</div>
              <InputNumber 
                value={player1.def} 
                onChange={(val) => setPlayer1(prev => ({ ...prev, def: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>生命</div>
              <InputNumber 
                value={player1.hp} 
                onChange={(val) => setPlayer1(prev => ({ ...prev, hp: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>魔法</div>
              <InputNumber 
                value={player1.mp} 
                onChange={(val) => setPlayer1(prev => ({ ...prev, mp: val ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>命中</div>
                <InputNumber 
                  value={player1.hitVal} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, hitVal: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>闪避</div>
                <InputNumber 
                  value={player1.dodge} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, dodge: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>暴击</div>
                <InputNumber 
                  value={player1.crit} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, crit: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>韧性</div>
                <InputNumber 
                  value={player1.tenacity} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, tenacity: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>幸运</div>
                <InputNumber 
                  value={player1.lucky} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, lucky: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守护</div>
                <InputNumber 
                  value={player1.guardian} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, guardian: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>穿透</div>
                <InputNumber 
                  min={0} 
                  value={player1.break} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, break: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>减伤</div>
                <InputNumber 
                  min={0} 
                  value={player1.protect} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, protect: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守御</div>
                <InputNumber 
                  min={0} 
                  value={player1.defP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, defP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>破防</div>
                <InputNumber 
                  min={0} 
                  value={player1.defSubtractP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, defSubtractP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>专注</div>
                <InputNumber 
                  min={0} 
                  value={player1.hitValP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, hitValP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>灵动</div>
                <InputNumber 
                  min={0} 
                  value={player1.dodgeP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, dodgeP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>会心</div>
                <InputNumber 
                  min={0} 
                  value={player1.critP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, critP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>化劲</div>
                <InputNumber 
                  min={0} 
                  value={player1.tenacityP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, tenacityP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>致命</div>
                <InputNumber 
                  min={0} 
                  value={player1.luckyP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, luckyP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>御劲</div>
                <InputNumber 
                  min={0} 
                  value={player1.guardianP} 
                  onChange={(val) => setPlayer1(prev => ({ ...prev, guardianP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="玩家二属性" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Input 
                  placeholder="输入UID" 
                  value={player2.uid}
                  onChange={(e) => setPlayer2(prev => ({ ...prev, uid: e.target.value }))}
                />
              </Col>
              <Col span={8}>
                <Button 
                  type="primary" 
                  loading={loading2} 
                  onClick={handleFetchPlayer2}
                  block
                >
                  获取属性
                </Button>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>等级</div>
                <InputNumber 
                  min={1} 
                  value={player2.level} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, level: val || 1 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>攻击</div>
                <InputNumber 
                  min={0} 
                  value={player2.atk} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, atk: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>防御</div>
                <InputNumber 
                  value={player2.def} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, def: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>生命</div>
                <InputNumber 
                  min={0} 
                  value={player2.hp} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, hp: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>魔法</div>
                <InputNumber 
                  min={0} 
                  value={player2.mp} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, mp: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>命中</div>
                <InputNumber 
                  min={0} 
                  value={player2.hitVal} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, hitVal: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>闪避</div>
                <InputNumber 
                  min={0} 
                  value={player2.dodge} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, dodge: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>暴击</div>
                <InputNumber 
                  min={0} 
                  value={player2.crit} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, crit: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>韧性</div>
                <InputNumber 
                  min={0} 
                  value={player2.tenacity} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, tenacity: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>幸运</div>
                <InputNumber 
                  min={0} 
                  value={player2.lucky} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, lucky: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守护</div>
                <InputNumber 
                  min={0} 
                  value={player2.guardian} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, guardian: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>穿透</div>
                <InputNumber 
                  min={0} 
                  value={player2.break} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, break: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>减伤</div>
                <InputNumber 
                  min={0} 
                  value={player2.protect} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, protect: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>守御</div>
                <InputNumber 
                  min={0} 
                  value={player2.defP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, defP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>破防</div>
                <InputNumber 
                  min={0} 
                  value={player2.defSubtractP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, defSubtractP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>专注</div>
                <InputNumber 
                  min={0} 
                  value={player2.hitValP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, hitValP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>灵动</div>
                <InputNumber 
                  min={0} 
                  value={player2.dodgeP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, dodgeP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>会心</div>
                <InputNumber 
                  min={0} 
                  value={player2.critP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, critP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>化劲</div>
                <InputNumber 
                  min={0} 
                  value={player2.tenacityP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, tenacityP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>致命</div>
                <InputNumber 
                  min={0} 
                  value={player2.luckyP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, luckyP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <div>御劲</div>
                <InputNumber 
                  min={0} 
                  value={player2.guardianP} 
                  onChange={(val) => setPlayer2(prev => ({ ...prev, guardianP: val || 0 }))}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button type="primary" size="large" onClick={handleCalculate}>
          计算 PVP 结果
        </Button>
        <Button style={{ marginLeft: 12 }} size="large" onClick={onUpdate}>
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

export default PVPCalculator;
