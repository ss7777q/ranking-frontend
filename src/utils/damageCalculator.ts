import api from '../services/api';
import ApiResponseHandler from './apiResponseHandler';

// 伤害计算核心引擎
export class DamageCalculator {
  private phyDefStandard: { [key: string]: number } = {};
  private sixDimStandard: { [key: string]: number } = {};

  constructor(standards: any) {
    if (standards) {
      this.phyDefStandard = standards.phyDefStandard || {};
      this.sixDimStandard = standards.sixDimStandard || {};
    }
  }

  // PVE伤害计算
  calculatePVEDamage(params: {
    level: number;
    phyDef: number;
    magDef: number;
    phyRes: number;
    magRes: number;
    attackPower: number;
    damageType: 'phy' | 'mag';
  }) {
    const { level, phyDef, magDef, phyRes, magRes, attackPower, damageType } = params;
    
    // 获取标准值
    const phyDefStandardValue = this.phyDefStandard[level] || 0;
    const sixDimStandardValue = this.sixDimStandard[level] || 0;

    // 选择对应的防御和抗性值
    const defValue = damageType === 'phy' ? phyDef : magDef;
    const resValue = damageType === 'phy' ? phyRes : magRes;
    
    // 计算免伤率
    const defReduction = defValue / (defValue + phyDefStandardValue);
    const resReduction = resValue / (resValue + sixDimStandardValue);
    const totalReduction = 1 - ((1 - defReduction) * (1 - resReduction));

    // 计算最终伤害
    const finalDamage = attackPower * (1 - totalReduction);

    return {
      defReduction: (defReduction * 100).toFixed(2),
      resReduction: (resReduction * 100).toFixed(2),
      totalReduction: (totalReduction * 100).toFixed(2),
      finalDamage: Math.round(finalDamage),
      originalDamage: attackPower
    };
  }

  // PVP伤害计算
  calculatePVPDamage(params: {
    attackerLevel: number;
    defenderLevel: number;
    attackPower: number;
    defenderPhyDef: number;
    defenderMagDef: number;
    defenderPhyRes: number;
    defenderMagRes: number;
    damageType: 'phy' | 'mag';
    penetration: number;
  }) {
    const {
      attackerLevel,
      defenderLevel,
      attackPower,
      defenderPhyDef,
      defenderMagDef,
      defenderPhyRes,
      defenderMagRes,
      damageType,
      penetration
    } = params;

    // 获取防御方的标准值
    const defenderPhyDefStandard = this.phyDefStandard[defenderLevel] || 0;
    const defenderSixDimStandard = this.sixDimStandard[defenderLevel] || 0;

    // 选择对应的防御和抗性值
    const defValue = damageType === 'phy' ? defenderPhyDef : defenderMagDef;
    const resValue = damageType === 'phy' ? defenderPhyRes : defenderMagRes;
    
    // 考虑穿透效果
    const effectiveDefValue = Math.max(0, defValue - penetration);
    
    // 计算免伤率
    const defReduction = effectiveDefValue / (effectiveDefValue + defenderPhyDefStandard);
    const resReduction = resValue / (resValue + defenderSixDimStandard);
    const totalReduction = 1 - ((1 - defReduction) * (1 - resReduction));

    // 计算最终伤害
    const finalDamage = attackPower * (1 - totalReduction);

    return {
      defReduction: (defReduction * 100).toFixed(2),
      resReduction: (resReduction * 100).toFixed(2),
      totalReduction: (totalReduction * 100).toFixed(2),
      finalDamage: Math.round(finalDamage),
      originalDamage: attackPower,
      effectiveDef: effectiveDefValue
    };
  }

  // 六维防御计算
  calculateSixDimDefense(level: number, sixDimValue: number) {
    const standard = this.sixDimStandard[level] || 0;
    const reduction = sixDimValue / (sixDimValue + standard);
    return (reduction * 100).toFixed(2);
  }

  // 物理防御计算
  calculatePhysicalDefense(level: number, phyDefValue: number) {
    const standard = this.phyDefStandard[level] || 0;
    const reduction = phyDefValue / (phyDefValue + standard);
    return (reduction * 100).toFixed(2);
  }
}

// 属性映射
export const attributeMap = {
  'atk': '攻击',
  'def': '防御', 
  'hp': '生命',
  'healHp': '回血',
  'healMp': '魔法恢复',
  'mp': '魔法值',
  'hitVal': '命中',
  'dodge': '闪避',
  'crit': '暴击',
  'tenacity': '韧性',
  'lucky': '幸运',
  'guardian': '守护',
  'break': '穿透',
  'protect': '减伤',
  'lv': '等级'
};

// API接口函数
// ...existing imports... (已在顶部引入 api)

export const fetchPlayerStats = async (uid: string, server?: number): Promise<any> => {
  try {
    // 使用 axios 实例调用角色详情接口，拦截器自动切换到 CHARACTER_API_BASE
    // 调用 axios 实例获取后端响应，响应拦截器已处理为 StandardResponse 格式
    const standardResp: any = await api.post<any, any>('/character/details', { uid });
    // 使用新的响应处理器，静默处理不显示自动消息，返回实际角色属性
    return ApiResponseHandler.handleResponseSilent(standardResp);
  } catch (error: any) {
    console.error('获取玩家数据失败:', error);
    
    // 根据错误消息提供更友好的错误信息
    let errorMsg = '获取玩家数据失败，请稍后重试';
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('未找到') || errorMessage.includes('角色数据')) {
      errorMsg = '未找到角色数据，请先更新角色信息';
    } else if (errorMessage.includes('UID') || errorMessage.includes('格式')) {
      errorMsg = 'UID格式错误或无效';
    } else if (errorMessage.includes('数据库') || errorMessage.includes('服务')) {
      errorMsg = '服务暂时不可用，请稍后重试';
    }
    
    throw new Error(errorMsg);
  }
};

export const searchBoss = async (keywords: string) => {
  try {
    const url = `http://zmwsapi.118qq.top/api/getMonster?keywords=${encodeURIComponent(keywords)}&computer=1&_t=${Date.now()}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 200 && data.data?.data?.length > 0) {
      return data.data.data;
    } else {
      throw new Error('未找到BOSS');
    }
  } catch (error) {
    console.error('搜索BOSS失败:', error);
    throw error;
  }
};
