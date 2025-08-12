import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import { powerAPI, petAPI, rideAPI } from '../services/api';
import { AppSettings, ServerStats, DistributionItem } from '../types';

interface StatisticsPageProps {
  settings: AppSettings;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ settings }) => {
  const [powerStats, setPowerStats] = useState<ServerStats>({});
  const [petStats, setPetStats] = useState<ServerStats>({});
  const [rideStats, setRideStats] = useState<ServerStats>({});
  const [petDistribution, setPetDistribution] = useState<DistributionItem[]>([]);
  const [rideDistribution, setRideDistribution] = useState<DistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 格式化数字显示
  const formatNumber = (num: number | undefined, useUnits: boolean = true): string => {
    if (!num) return '0';
    if (useUnits) {
      if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}亿`;
      } else if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}万`;
      }
    }
    return num.toString();
  };

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const [powerData, petData, rideData, petDist, rideDist] = await Promise.all([
        powerAPI.getStats(settings.serverId),
        petAPI.getStats(settings.serverId),
        rideAPI.getStats(settings.serverId),
        petAPI.getDistribution(settings.serverId),
        rideAPI.getDistribution(settings.serverId),
      ]);

      setPowerStats(powerData);
      setPetStats(petData);
      setRideStats(rideData);
      setPetDistribution(petDist.slice(0, 10)); // 只显示前10名
      setRideDistribution(rideDist.slice(0, 10)); // 只显示前10名
    } catch (error) {
      console.error('加载统计数据失败:', error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [settings.serverId]);

  // 宠物分布饼图配置
  const petChartOption = {
    title: {
      text: '宠物种类分布 (前10名)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: petDistribution.map(item => item.pet_name || item.name),
    },
    series: [
      {
        name: '宠物数量',
        type: 'pie',
        radius: '50%',
        data: petDistribution.map(item => ({
          value: item.count,
          name: item.pet_name || item.name,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 坐骑分布饼图配置
  const rideChartOption = {
    title: {
      text: '坐骑种类分布 (前10名)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: rideDistribution.map(item => item.ride_name || item.name),
    },
    series: [
      {
        name: '坐骑数量',
        type: 'pie',
        radius: '50%',
        data: rideDistribution.map(item => ({
          value: item.count,
          name: item.ride_name || item.name,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载统计数据中...</div>
      </div>
    );
  }

  return (
    <div>
      <h2>📊 统计分析</h2>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 战力统计 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="⚔️ 战力排行榜" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总玩家数"
                  value={powerStats.total_players || 0}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="角色种类"
                  value={powerStats.unique_characters || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="最高战力"
                  value={formatNumber(powerStats.max_score, settings.useUnits)}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="平均战力"
                  value={formatNumber(Math.round(powerStats.avg_score || 0), settings.useUnits)}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 宠物统计 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="🐾 宠物排行榜" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总宠物数"
                  value={petStats.total_pets || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="宠物种类"
                  value={petStats.unique_pets || 0}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Statistic
                  title="最高战力"
                  value={formatNumber(petStats.max_score, settings.useUnits)}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 坐骑统计 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="🐎 坐骑排行榜" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总坐骑数"
                  value={rideStats.total_rides || 0}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="坐骑种类"
                  value={rideStats.unique_rides || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Statistic
                  title="最高战力"
                  value={formatNumber(rideStats.max_score, settings.useUnits)}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 图表分析 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="🐾 宠物种类分布" bordered={false}>
            {petDistribution.length > 0 ? (
              <ReactECharts option={petChartOption} style={{ height: '400px' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px' }}>暂无宠物分布数据</div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="🐎 坐骑种类分布" bordered={false}>
            {rideDistribution.length > 0 ? (
              <ReactECharts option={rideChartOption} style={{ height: '400px' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px' }}>暂无坐骑分布数据</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
