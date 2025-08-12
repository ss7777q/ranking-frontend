import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Space, Button, message, Tag, Tooltip } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { powerAPI, configAPI } from '../services/api';
import { AppSettings, PowerRankingItem, SelectOption } from '../types';

interface PowerRankingsProps {
  settings: AppSettings;
}

const PowerRankings: React.FC<PowerRankingsProps> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PowerRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<SelectOption[]>([]);

  // 加载角色列表
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const result = await configAPI.getCharacters();
        setCharacters(result);
      } catch (error) {
        console.error('加载角色列表失败:', error);
      }
    };
    loadCharacters();
  }, []);

  // 加载数据
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const result = await powerAPI.getRankings({
        page,
        page_size: settings.pageSize,
        server_id: settings.serverId,
        character_id: characterId,
        use_units: settings.useUnits,
      });

      // 添加筛选排名
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

  // 初始加载和依赖更新
  useEffect(() => {
    loadData(1);
  }, [settings.pageSize, settings.serverId, settings.useUnits, characterId]);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handleCharacterChange = (value: number | null) => {
    setCharacterId(value);
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
      title: '玩家名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => (
        <Tooltip title={name}>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '上榜战力',
      dataIndex: 'formatted_score',
      key: 'score',
      width: 100,
      render: (score: string) => (
        <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span>
      ),
    },
    {
      title: '当前战力',
      dataIndex: 'formatted_fightpoint',
      key: 'fightpoint',
      width: 100,
      render: (fightpoint: string) => (
        <span style={{ color: '#fa8c16' }}>{fightpoint}</span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'lv',
      key: 'lv',
      width: 70,
      render: (lv: number) => (
        <Tag color="green">{lv}</Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'character_name',
      key: 'character_name',
      width: 100,
    },
    {
      title: '联盟',
      dataIndex: 'league_name',
      key: 'league_name',
      width: 120,
      render: (league: string) => league || '无',
    },
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      render: (uid: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{uid}</span>
      ),
    },
    {
      title: '地区',
      dataIndex: 'ip_area',
      key: 'ip_area',
      width: 100,
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
            <span>⚔️ 战力排行榜</span>
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
              placeholder="选择角色"
              style={{ width: 120 }}
              value={characterId}
              onChange={handleCharacterChange}
              allowClear
            >
              {characters.map(char => (
                <Select.Option key={char.id} value={char.id}>
                  {char.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Table
          sticky
          className="ranking-table"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="uid"
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
        />
      </Card>
    </div>
  );
};

export default PowerRankings;
