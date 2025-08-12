import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  message, 
  Space, 
  Spin, 
  Switch, 
  Row, 
  Col,
  Statistic,
  Typography,
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PercentageOutlined,
  NumberOutlined 
} from '@ant-design/icons';
import { systemPowerAPI } from '../services/api';
import { AppSettings } from '../types';
import ApiResponseHandler from '../utils/apiResponseHandler';

const { Title, Text } = Typography;

interface SystemPowerDetailsProps {
  settings: AppSettings;
}

// 属性映射
const ATTR_MAP = {
  "hp": "生命",
  "mp": "魔法", 
  "atk": "攻击",
  "def": "防御",
  "healHp": "回血",
  "healMp": "回魔",
  "hitVal": "命中",
  "dodge": "闪避",
  "crit": "暴击",
  "tenacity": "韧性",
  "lucky": "幸运",
  "guardian": "守护",
  "break": "穿透",
  "protect": "减伤"
};

// 属性颜色映射
const ATTR_COLORS: { [key: string]: string } = {
  "攻击": "#E0D040",
  "幸运": "#E04080",
  "暴击": "#B040D0",
  "魔法": "#4080E0",
  "命中": "#40E0C0",
  "回魔": "#7040B0",
  "防御": "#3A3A3A",
  "生命": "#C73A3A",
  "回血": "#C76B3A",
  "闪避": "#A0A0A0",
  "韧性": "#C78CA0",
  "守护": "#3AC76B",
  "穿透": "#3A3A3A",
  "减伤": "#3A3A3A"
};

// 系统名称映射
const SYSTEM_MAP = {
  "level": "基础属性",
  "heartMethod": "修心属性",
  // 装备相关子系统
  "equipmentBaseUpgrade": "装备基础属性",
  "equipmentAffix": "装备附加属性",
  "equipmentGemstone": "宝石属性",
  "equipmentSet": "装备套装",
  "fashion": "时装属性",
  "neidan": "内丹属性",
  "titles": "称号属性",
  "magics": "法宝属性",
  "wings": "翅膀属性",
  "feathers": "羽毛属性",
  "training": "炼体属性",
  "matrix": "阵法属性",
  "galaxy": "星核属性",
  "meridians": "外丹属性",
  "smelting": "熔炼属性",
  "sum": "总属性"
};

const SystemPowerDetails: React.FC<SystemPowerDetailsProps> = ({ settings }) => {
  const [uid, setUid] = useState<string>('');
  const [compareUid, setCompareUid] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [systemData, setSystemData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [showPercentage, setShowPercentage] = useState<boolean>(false);
  const [compareShowPercentage, setCompareShowPercentage] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [compareLastUpdated, setCompareLastUpdated] = useState<string>('');

  // 查询系统战力
  const handleQuery = async () => {
    if (!uid.trim()) {
      message.warning('请输入角色UID');
      return;
    }
    setLoading(true);
    try {
      const response = await systemPowerAPI.getSystemPower(uid.trim()); // StandardResponse<any>
      const data = ApiResponseHandler.handleResponse(response);
      setSystemData(data);
      setLastUpdated(response.timestamp || '');
    } catch (error: any) {
      console.error('查询系统战力失败:', error);
      message.error(error.message || '查询失败');
      setSystemData(null);
    } finally {
      setLoading(false);
    }
  };

  // 更新系统战力
  const handleUpdate = async () => {
    if (!uid.trim()) {
      message.warning('请输入角色UID');
      return;
    }
    setLoading(true);
    try {
      const response = await systemPowerAPI.updateSystemPower(uid.trim());
      const data = ApiResponseHandler.handleResponse(response);
      setSystemData(data);
      setLastUpdated(response.timestamp || '');
    } catch (error: any) {
      console.error('更新系统战力失败:', error);
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 查询对比目标系统战力
  const handleCompareQuery = async () => {
    if (!compareUid.trim()) {
      message.warning('请输入对比角色UID');
      return;
    }
    setCompareLoading(true);
    try {
      const response = await systemPowerAPI.getSystemPower(compareUid.trim());
      const data = ApiResponseHandler.handleResponse(response);
      setCompareData(data);
      setCompareLastUpdated(response.timestamp || '');
    } catch (error: any) {
      console.error('查询对比角色系统战力失败:', error);
      message.error(error.message || '对比角色查询失败');
      setCompareData(null);
    } finally {
      setCompareLoading(false);
    }
  };

  // 更新对比目标系统战力
  const handleCompareUpdate = async () => {
    if (!compareUid.trim()) {
      message.warning('请输入对比角色UID');
      return;
    }
    setCompareLoading(true);
    try {
      const response = await systemPowerAPI.updateSystemPower(compareUid.trim());
      const data = ApiResponseHandler.handleResponse(response);
      setCompareData(data);
      setCompareLastUpdated(response.timestamp || '');
    } catch (error: any) {
      console.error('更新对比角色系统战力失败:', error);
      message.error(error.message || '对比角色更新失败');
    } finally {
      setCompareLoading(false);
    }
  };

  // 构建表格数据
  const buildTableData = () => {
    if (!systemData) return [];

    const totalAttrs = systemData.sum?.attrs || {};
    const totalPower = systemData.sum?.fightPower || 0;

    return Object.entries(SYSTEM_MAP)
      .filter(([key]) => key !== 'sum' && systemData[key]) // 排除总属性行，它会单独显示
      .map(([systemKey, systemName]) => {
        const system = systemData[systemKey];
        if (!system) return null;

        const row: any = {
          key: systemKey,
          system: systemName,
          fightPower: system.fightPower || 0,
        };

    // 添加各个属性列
    Object.entries(ATTR_MAP).forEach(([attrKey, attrName]) => {
      const value = system.attrs?.[attrKey] || 0;
      const totalValue = totalAttrs[attrKey] || 0;
      const color = ATTR_COLORS[attrName] || '#1890ff';
      
      if (showPercentage && totalValue > 0) {
        row[attrKey] = {
          value: `${((value / totalValue) * 100).toFixed(2)}%`,
          color: color
        };
      } else {
        row[attrKey] = {
          value: settings.useUnits ? value.toLocaleString() : value,
          color: color
        };
      }
    });

        // 战力百分比
        if (showPercentage && totalPower > 0) {
          row.fightPowerPercent = `${((row.fightPower / totalPower) * 100).toFixed(2)}%`;
        }

        return row;
      })
      .filter(Boolean);
  };

  // 构建表格列
  const buildTableColumns = () => {
    const columns: any[] = [
      {
        title: '系统',
        dataIndex: 'system',
        key: 'system',
        fixed: 'left',
        width: 120,
        align: 'center',
        render: (text: string) => <strong>{text}</strong>,
      },
      // 首先显示战力或战力占比
      {
        title: showPercentage ? '战力占比' : '战力',
        dataIndex: showPercentage ? 'fightPowerPercent' : 'fightPower',
        key: 'fightPower',
        width: 100,
        align: 'center',
        render: (value: any) => showPercentage
          ? <Tag color="blue">{value}</Tag>
          : <Tag color="gold">{settings.useUnits ? (value as number).toLocaleString() : value}</Tag>,
      }
    ];

    // 添加属性列
    Object.entries(ATTR_MAP).forEach(([attrKey, attrName]) => {
      const color = ATTR_COLORS[attrName] || '#1890ff';
      columns.push({
        title: <span style={{ color, fontWeight: 'bold' }}>{attrName}</span>,
        dataIndex: attrKey,
        key: attrKey,
        width: 100,
        align: 'center',
        render: (cellData: any) => {
          if (cellData && typeof cellData === 'object' && cellData.value !== undefined) {
            return <span style={{ color: cellData.color, fontWeight: 'bold' }}>{cellData.value || '-'}</span>;
          }
          return cellData || '-';
        },
      });
    });

    return columns;
  };

  // 构建对比表格数据
  const buildCompareTableData = () => {
    if (!systemData || !compareData) return [];

    const myAttrs = systemData.sum?.attrs || {};
    const compareAttrs = compareData.sum?.attrs || {};
    const myPower = systemData.sum?.fightPower || 0;
    const comparePower = compareData.sum?.fightPower || 0;

    // 计算总差值用于百分比计算
    const totalPowerDiff = myPower - comparePower;
    const totalAttrDiffs: { [key: string]: number } = {};
    Object.keys(ATTR_MAP).forEach(attrKey => {
      totalAttrDiffs[attrKey] = (myAttrs[attrKey] || 0) - (compareAttrs[attrKey] || 0);
    });

    return Object.entries(SYSTEM_MAP)
      .filter(([key]) => key !== 'sum' && systemData[key] && compareData[key])
      .map(([systemKey, systemName]) => {
        const mySystem = systemData[systemKey];
        const compareSystem = compareData[systemKey];
        if (!mySystem || !compareSystem) return null;

        const powerDiff = (mySystem.fightPower || 0) - (compareSystem.fightPower || 0);

        const row: any = {
          key: systemKey,
          system: systemName,
          fightPower: powerDiff,
        };

        // 添加各个属性列的差值
        Object.entries(ATTR_MAP).forEach(([attrKey, attrName]) => {
          const myValue = mySystem.attrs?.[attrKey] || 0;
          const compareValue = compareSystem.attrs?.[attrKey] || 0;
          const diff = myValue - compareValue;
          const color = ATTR_COLORS[attrName] || '#1890ff';
          
          if (showPercentage && totalAttrDiffs[attrKey] !== 0) {
            row[attrKey] = {
              value: `${((diff / totalAttrDiffs[attrKey]) * 100).toFixed(2)}%`,
              color: color
            };
          } else {
            row[attrKey] = {
              value: settings.useUnits ? diff.toLocaleString() : diff,
              color: color
            };
          }
        });

        // 战力百分比
        if (showPercentage && totalPowerDiff !== 0) {
          row.fightPowerPercent = `${((powerDiff / totalPowerDiff) * 100).toFixed(2)}%`;
        }

        return row;
      })
      .filter(Boolean);
  };

  // 构建对比表格列
  const buildCompareTableColumns = () => {
    const columns: any[] = [
      // ...系统列与属性列与构建函数类似
    ];
    // 系统列
    columns.push({
      title: '系统', dataIndex: 'system', key: 'system', fixed: 'left', width: 120,
      align: 'center',
      render: (text: string) => <strong>{text}</strong>,
    });
    // 战力列放在首位
    columns.push({
      title: compareShowPercentage ? '战力占比' : '战力',
      dataIndex: compareShowPercentage ? 'fightPowerPercent' : 'fightPower',
      key: 'fightPower', width: 120, align: 'center',
      render: (value: any) => <Tag color={compareShowPercentage ? 'blue' : 'gold'}>{value}</Tag>,
    });
    // 属性列
    Object.entries(ATTR_MAP).forEach(([attrKey, attrName]) => {
      const color = ATTR_COLORS[attrName] || '#1890ff';
      columns.push({
        title: <span style={{ color, fontWeight: 'bold' }}>{attrName}</span>,
        dataIndex: attrKey,
        key: attrKey,
        width: 100,
        align: 'center',
        render: (cellData: any) => {
          if (cellData && typeof cellData === 'object') {
            return <span style={{ color: cellData.color, fontWeight: 'bold' }}>{cellData.value || '-'}</span>;
          }
          return cellData || '-';
        },
      });
    });
    return columns;
  };

  const tableData = buildTableData();
  const tableColumns = buildTableColumns();
  const compareTableData = buildCompareTableData();
  const compareColumns = buildCompareTableColumns();

  return (
    <div>
      <Card title="角色各系统详情" style={{ marginBottom: 16 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="请输入角色UID"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              onPressEnter={handleQuery}
              size="large"
            />
          </Col>
          <Col span={16}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleQuery}
                loading={loading}
                size="large"
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleUpdate}
                loading={loading}
                size="large"
              >
                更新属性
              </Button>
            </Space>
          </Col>
        </Row>

        {lastUpdated && (
          <Text type="secondary">最后更新时间: {lastUpdated}</Text>
        )}
      </Card>

      {systemData && (
        <>
          {/* 总属性统计 */}
          <Card title="总属性统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="总战力"
                  value={systemData.sum?.fightPower || 0}
                  formatter={(value) => settings.useUnits ? value.toLocaleString() : value}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {Object.entries(ATTR_MAP).map(([attrKey, attrName], index) => {
                const value = systemData.sum?.attrs?.[attrKey] || 0;
                const color = ATTR_COLORS[attrName] || '#1890ff';
                return (
                  <Col span={6} key={attrKey}>
                    <Statistic
                      title={<span style={{ color }}>{attrName}</span>}
                      value={value}
                      formatter={(value) => settings.useUnits ? value.toLocaleString() : value}
                      valueStyle={{ color, fontWeight: 'bold' }}
                    />
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* 控制面板 */}
          <Card style={{ marginBottom: 16 }}>
            <Row align="middle" gutter={16}>
              <Col>
                <Text strong>显示模式:</Text>
              </Col>
              <Col>
                <Switch
                  checked={showPercentage}
                  onChange={setShowPercentage}
                  checkedChildren={<PercentageOutlined />}
                  unCheckedChildren={<NumberOutlined />}
                />
              </Col>
              <Col>
                <Text type="secondary">
                  {showPercentage ? '百分比模式' : '数值模式'}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* 系统详情表格 */}
          <Card title="各系统详情">
            <Spin spinning={loading}>
              <Table
                columns={tableColumns}
                dataSource={tableData}
                pagination={false}
                scroll={{ x: 1500, y: 600 }}
                size="small"
                bordered
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
              />
            </Spin>
          </Card>
        </>
      )}

      {/* 对比界面 */}
      <Card title="角色对比" style={{ marginBottom: 16 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="请输入对比角色UID"
              value={compareUid}
              onChange={(e) => setCompareUid(e.target.value)}
              onPressEnter={handleCompareQuery}
              size="large"
            />
          </Col>
          <Col span={16}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleCompareQuery}
                loading={compareLoading}
                size="large"
              >
                查询对比
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleCompareUpdate}
                loading={compareLoading}
                size="large"
              >
                更新对比属性
              </Button>
            </Space>
          </Col>
        </Row>

        {compareLastUpdated && (
          <Text type="secondary">对比角色最后更新时间: {compareLastUpdated}</Text>
        )}
      </Card>

      {systemData && compareData && (
        <>
          {/* 对比总属性统计 */}
          <Card title="属性对比 (我方 - 对方)" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="战力差"
                  value={(systemData.sum?.fightPower || 0) - (compareData.sum?.fightPower || 0)}
                  formatter={(value) => {
                    const num = Number(value);
                    const formatted = settings.useUnits ? Math.abs(num).toLocaleString() : Math.abs(num);
                    return num >= 0 ? `+${formatted}` : `-${formatted}`;
                  }}
                  valueStyle={{ 
                    color: (systemData.sum?.fightPower || 0) - (compareData.sum?.fightPower || 0) >= 0 ? '#52c41a' : '#ff4d4f' 
                  }}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {Object.entries(ATTR_MAP).map(([attrKey, attrName]) => {
                const myValue = systemData.sum?.attrs?.[attrKey] || 0;
                const compareValue = compareData.sum?.attrs?.[attrKey] || 0;
                const diff = myValue - compareValue;
                const color = ATTR_COLORS[attrName] || '#1890ff';
                return (
                  <Col span={6} key={attrKey}>
                    <Statistic
                      title={<span style={{ color }}>{attrName}差</span>}
                      value={diff}
                      formatter={(value) => {
                        const num = Number(value);
                        const formatted = settings.useUnits ? Math.abs(num).toLocaleString() : Math.abs(num);
                        return num >= 0 ? `+${formatted}` : `-${formatted}`;
                      }}
                      valueStyle={{ 
                        color: diff >= 0 ? '#52c41a' : '#ff4d4f',
                        fontWeight: 'bold' 
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* 对比详情表格 */}
          <Card title="各系统对比详情">
            <Spin spinning={compareLoading}>
              <Table
                columns={compareColumns}
                dataSource={compareTableData}
                pagination={false}
                scroll={{ x: 1500, y: 600 }}
                size="small"
                bordered
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
              />
            </Spin>
          </Card>
        </>
      )}

      {!compareData && compareUid && !compareLoading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Text type="secondary" style={{ fontSize: 16 }}>
              请点击查询对比按钮获取对比角色的系统战力详情
            </Text>
          </div>
        </Card>
      )}

      {!systemData && !loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary" style={{ fontSize: 16 }}>
              请输入角色UID并点击查询按钮获取系统战力详情
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SystemPowerDetails;
