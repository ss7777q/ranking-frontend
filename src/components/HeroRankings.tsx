import React, { useState, useEffect } from 'react';
import { Card, Select, Table, Alert, Typography, Spin, message } from 'antd';
import { heroAPI, configAPI } from '../services/api';
import { PaginatedResponse, HeroRankingItem, SelectOption } from '../types';

const { Option } = Select;
const { Paragraph, Title, Text } = Typography;

interface HeroRankingsProps {
  settings: {
    useUnits: boolean;
    pageSize: number;
    serverId: number | null;
  };
}

const HeroRankings: React.FC<HeroRankingsProps> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<SelectOption[]>([]);
  const [selectedChar, setSelectedChar] = useState<number | null>(null);
  const [updateTime, setUpdateTime] = useState<string>('');
  const [data, setData] = useState<HeroRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    configAPI.getCharacters().then(setCharacters).catch(() => {});
    fetchUpdateTime();
    fetchData(1, selectedChar);
  }, []);

  const fetchUpdateTime = async () => {
    try {
      const res = await heroAPI.getUpdateTime();
      setUpdateTime(res.update_time);
    } catch (e) {
      console.error('获取更新时间失败', e);
    }
  };

  const fetchData = async (pageNum: number, charId: number | null) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, page_size: settings.pageSize, use_units: settings.useUnits };
      let res: PaginatedResponse<HeroRankingItem>;
      console.log('HeroRankings - 请求参数:', { pageNum, charId, params });
      
      if (charId) {
        params.character_id = charId;
        res = await heroAPI.getRankings(params);
        console.log('HeroRankings - 角色分榜数据:', res);
      } else {
        res = await heroAPI.getAllRankings(params);
        console.log('HeroRankings - 全角色数据:', res);
      }
      
      setData(res.items as HeroRankingItem[]);
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      console.error('HeroRankings - 请求失败:', err);
      message.error('加载失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: '排名', 
      dataIndex: 'rank', 
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <span style={{ fontWeight: 'bold', color: rank <= 10 ? '#f5222d' : '#666' }}>
          #{rank}
        </span>
      ),
    },
    { 
      title: '服务器排名', 
      dataIndex: 'server_rank', 
      key: 'server_rank',
      width: 100,
      render: (rank: number) => (
        <span style={{ color: '#1890ff' }}>
          #{rank}
        </span>
      ),
    },
    { 
      title: '姓名', 
      dataIndex: 'name', 
      key: 'name',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>
      )
    },
    { 
      title: '修正战力', 
      dataIndex: 'formatted_score', 
      key: 'score',
      width: 120,
      render: (score: string) => (
        <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span>
      )
    },
    { 
      title: '原始战力', 
      dataIndex: 'formatted_fightpoint', 
      key: 'fightpoint',
      width: 120,
      render: (fp: string) => (
        <span style={{ color: '#fa8c16' }}>{fp}</span>
      )
    },
    { 
      title: '角色', 
      dataIndex: 'character_name', 
      key: 'character_name',
      width: 100,
      render: (char: string) => (
        <span style={{ fontWeight: 'bold', color: '#722ed1' }}>{char}</span>
      )
    },
    { 
      title: '等级', 
      dataIndex: 'lv', 
      key: 'lv',
      width: 80,
      render: (lv: number) => (
        <span style={{ color: '#52c41a' }}>Lv.{lv}</span>
      )
    },
    { 
      title: '联盟', 
      dataIndex: 'league_name', 
      key: 'league_name',
      width: 150,
      render: (league: string) => league || '无联盟'
    },
    { 
      title: 'UID', 
      dataIndex: 'uid', 
      key: 'uid',
      width: 120,
      render: (uid: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{uid}</span>
      )
    },
    { 
      title: '服务器', 
      dataIndex: 'server_id', 
      key: 'server_id',
      width: 100,
      render: (sid: number) => `服务器${sid}`
    },
  ];

  const handleCharChange = (value: number | null) => {
    setSelectedChar(value);
    fetchData(1, value);
  };

  return (
    <Card>
      <Title level={4}>角色排行榜</Title>
      <Alert
        type="info"
        showIcon
        message="角色总榜与分榜说明"
        description={
          <div>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>角色总榜：</strong>若统计时同一玩家在不同的角色榜上，则保留战力最高的角色，即副角色不计入。
            </Paragraph>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>角色分榜：</strong>保留了同一玩家在不同排行榜的排名，即计入了副角色。
            </Paragraph>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>统计时间：</strong>{updateTime || '加载中...'}
            </Paragraph>
          </div>
        }
        style={{ marginBottom: 20, fontSize: '14px' }}
      />
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ marginRight: 12, fontSize: 16 }}>选择角色：</Text>
        <Select
          size="large"
          style={{ width: 240 }}
          value={selectedChar}
          placeholder="全角色"
          onChange={handleCharChange}
          allowClear
        >
          {characters.map(c => (
            <Option key={c.id} value={c.id}>{c.name}</Option>
          ))}
        </Select>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={r => `${r.uid}_${r.character_id}_${r.server_id}`}
          pagination={{
            current: page,
            pageSize: settings.pageSize,
            total,
            onChange: p => fetchData(p, selectedChar),
          }}
        />
      )}
    </Card>
  );
};

export default HeroRankings;
