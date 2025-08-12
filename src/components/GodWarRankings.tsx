import React, { useEffect, useState } from 'react';
import { Card, Table, Space, Button, Select, Tag, Segmented, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, FilterOutlined, CrownOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { AppSettings, GodWarRankingItem, SelectOption } from '../types';
import { godWarAPI, configAPI } from '../services/api';

interface Props { settings: AppSettings }

const GodWarRankings: React.FC<Props> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GodWarRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<'plunder' | 'devil'>('plunder');
  const [characters, setCharacters] = useState<SelectOption[]>([]);
  const [characterId, setCharacterId] = useState<number | null>(null);

  useEffect(() => {
    configAPI.getCharacters().then(setCharacters).catch(() => {});
  }, []);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await godWarAPI.getRankings({
        page: p,
        page_size: settings.pageSize,
        type,
        server_id: settings.serverId,
        use_units: settings.useUnits,
      });
      const items = res.items.filter(i => !characterId || i.character_id === characterId);
      setData(items);
      setTotal(res.total);
      setPage(p);
    } catch (e) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [settings.pageSize, settings.serverId, settings.useUnits, type, characterId]);

  const columns: ColumnsType<GodWarRankingItem> = [
    { title: '全服排名', dataIndex: 'rank', key: 'rank', width: 80, align: 'center', render: (v: number) => <Tag color={v<=3?'gold':'blue'} style={{ fontWeight: 'bold' }}>{v}</Tag> },
    { title: '玩家', dataIndex: 'name', key: 'name', width: 140, align: 'center', render: name => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span> },
    { title: '战力', dataIndex: 'formatted_fightpoint', key: 'fightpoint', width: 120, align: 'center', render: fp => <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>{fp}</span> },
    { title: '分数', dataIndex: 'formatted_score', key: 'score', width: 120, align: 'center', render: score => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span> },
    { title: 'UID', dataIndex: 'uid', key: 'uid', width: 140, align: 'center', render: uid => <span style={{ color: '#722ed1' }}>{uid}</span> },
    { title: '角色', dataIndex: 'character_name', key: 'character_name', width: 120, align: 'center', render: name => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{name}</span> },
    { title: '联盟', dataIndex: 'league_name', key: 'league_name', width: 140, align: 'center', render: (t: string | undefined) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{t||'无'}</span> },
    { title: '地区', dataIndex: 'ip_area', key: 'ip_area', width: 120, align: 'center', render: ip => <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>{ip}</span> },
  ];

  return (
    <Card 
      title={<Space>{type==='plunder'?<CrownOutlined/>:<ThunderboltOutlined/>}{type==='plunder'?'神将排行榜':'魔王排行榜'}</Space>}
      extra={
        <Space>
          <Segmented 
            value={type}
            onChange={(val)=>setType(val as any)}
            options={[{label:'神将',value:'plunder'},{label:'魔王',value:'devil'}]}
          />
          <FilterOutlined />
          <Select
            placeholder="选择角色"
            style={{ width: 140 }}
            value={characterId}
            onChange={(v)=>setCharacterId(v)}
            allowClear
          >
            {characters.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={()=>load(page)} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
  <Table<GodWarRankingItem>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={r=>`${r.uid}-${r.server_id}`}
        pagination={{
          current: page, pageSize: settings.pageSize, total, showTotal: t=>`共 ${t} 条`, onChange: p=>load(p)
        }}
        scroll={{ x: 900 }}
        size="small"
        bordered
      />
    </Card>
  );
};

export default GodWarRankings;
