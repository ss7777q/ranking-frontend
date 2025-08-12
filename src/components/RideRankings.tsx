import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Space, Button, message, Tag, Tooltip } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { rideAPI } from '../services/api';
import { AppSettings, RideRankingItem, SelectOption } from '../types';

interface RideRankingsProps {
  settings: AppSettings;
}

const RideRankings: React.FC<RideRankingsProps> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RideRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rideId, setRideId] = useState<number | null>(null);
  const [rideTypes, setRideTypes] = useState<SelectOption[]>([]);

  // 加载坐骑类型
  useEffect(() => {
    const loadRideTypes = async () => {
      try {
        const result = await rideAPI.getTypes();
        setRideTypes(result);
      } catch (error) {
        console.error('加载坐骑类型失败:', error);
      }
    };
    loadRideTypes();
  }, []);

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const result = await rideAPI.getRankings({
        page,
        page_size: settings.pageSize,
        server_id: settings.serverId,
        ride_id: rideId,
        use_units: settings.useUnits,
      });

      const itemsWithFilteredRank = result.items.map((item, index) => ({
        ...item,
        filtered_rank: (page - 1) * settings.pageSize + index + 1,
      }));

      setData(itemsWithFilteredRank);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [settings.pageSize, settings.serverId, settings.useUnits, rideId]);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handleRideChange = (value: number | null) => {
    setRideId(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: '总榜排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 10 ? 'orange' : 'default'}>
          {rank}
        </Tag>
      ),
    },
    {
      title: '筛选排名',
      dataIndex: 'filtered_rank',
      key: 'filtered_rank',
      width: 80,
      render: (rank: number) => (
        <Tag color="blue">{rank}</Tag>
      ),
    },
    {
      title: '坐骑种类',
      dataIndex: 'ride_name',
      key: 'ride_name',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 'bold', color: '#13c2c2' }}>{name}</span>
      ),
    },
    {
      title: '战力',
      dataIndex: 'formatted_score',
      key: 'score',
      width: 100,
      render: (score: string) => (
        <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'ride_level',
      key: 'ride_level',
      width: 70,
      render: (lv: number) => (
        <Tag color="green">{lv}</Tag>
      ),
    },
    {
      title: '坐骑昵称',
      dataIndex: 'ride_nickname',
      key: 'ride_nickname',
      width: 120,
      render: (nickname: string) => (
        <Tooltip title={nickname}>
          <span style={{ color: '#fa8c16' }}>{nickname || '无昵称'}</span>
        </Tooltip>
      ),
    },
    {
      title: '主人名字',
      dataIndex: 'owner_name',
      key: 'owner_name',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>
      ),
    },
    {
      title: '坐骑皮肤',
      dataIndex: 'ride_skin_name',
      key: 'ride_skin_name',
      width: 120,
      render: (skin: string) => skin || '默认',
    },
    {
      title: '主人UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      render: (uid: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{uid}</span>
      ),
    },
    {
      title: '服务器',
      dataIndex: 'server_id',
      key: 'server_id',
      width: 80,
      render: (serverId: number) => (
        <Tag color="purple">服务器{serverId}</Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>🐎 坐骑排行榜</span>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        extra={
          <Space>
            <FilterOutlined />
            <Select
              placeholder="选择坐骑类型"
              style={{ width: 140 }}
              value={rideId}
              onChange={handleRideChange}
              allowClear
            >
              {rideTypes.map(ride => (
                <Select.Option key={ride.id} value={ride.id}>
                  {ride.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Table
          className="ranking-table"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="uid"
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: settings.pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: (page) => loadData(page),
          }}
          size="small"
          bordered
        />
      </Card>
    </div>
  );
};

export default RideRankings;
