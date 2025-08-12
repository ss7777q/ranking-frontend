import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Space, Button, message, Tag, Tooltip } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { petAPI } from '../services/api';
import { AppSettings, PetRankingItem, SelectOption } from '../types';

interface PetRankingsProps {
  settings: AppSettings;
}

const PetRankings: React.FC<PetRankingsProps> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PetRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [petId, setPetId] = useState<number | null>(null);
  const [petTypes, setPetTypes] = useState<SelectOption[]>([]);

  // 加载宠物类型
  useEffect(() => {
    const loadPetTypes = async () => {
      try {
        const result = await petAPI.getTypes();
        setPetTypes(result);
      } catch (error) {
        console.error('加载宠物类型失败:', error);
      }
    };
    loadPetTypes();
  }, []);

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const result = await petAPI.getRankings({
        page,
        page_size: settings.pageSize,
        server_id: settings.serverId,
        pet_id: petId,
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
  }, [settings.pageSize, settings.serverId, settings.useUnits, petId]);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handlePetChange = (value: number | null) => {
    setPetId(value);
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
      title: '宠物种类',
      dataIndex: 'pet_name',
      key: 'pet_name',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 'bold', color: '#722ed1' }}>{name}</span>
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
      dataIndex: 'owner_level',
      key: 'owner_level',
      width: 70,
      render: (lv: number) => (
        <Tag color="green">{lv}</Tag>
      ),
    },
    {
      title: '宠物昵称',
      dataIndex: 'pet_nickname',
      key: 'pet_nickname',
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
      title: '宠物皮肤',
      dataIndex: 'pet_skin_name',
      key: 'pet_skin_name',
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
            <span>🐾 宠物排行榜</span>
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
              placeholder="选择宠物类型"
              style={{ width: 140 }}
              value={petId}
              onChange={handlePetChange}
              allowClear
            >
              {petTypes.map(pet => (
                <Select.Option key={pet.id} value={pet.id}>
                  {pet.name}
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
          rowKey={(record) => `${record.uid}_${record.pet_name}`}
          scroll={{ x: 1200 }}
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
          sticky
        />
      </Card>
    </div>
  );
};

export default PetRankings;
