import React, { useEffect, useState } from 'react';
import { Card, Table, Space, Button, Tag, message, Popover } from 'antd';
import { ReloadOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppSettings, LeagueRankingItem } from '../types';
import { leagueAPI } from '../services/api';

interface Props { settings: AppSettings }

const LeagueRankings: React.FC<Props> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeagueRankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await leagueAPI.getRankings({
        page: p,
        page_size: settings.pageSize,
        server_id: settings.serverId,
        use_units: settings.useUnits,
      });
      setData(res.items);
      setTotal(res.total);
      setPage(p);
    } catch (e) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [settings.pageSize, settings.serverId, settings.useUnits]);

  const columns: ColumnsType<LeagueRankingItem> = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, align: 'center', render: (v?: number) => <Tag color={v && v<=3 ? 'gold':'blue'} style={{ fontWeight: 'bold' }}>{v ?? '-'}</Tag> },
    { title: '区服', dataIndex: 'server_id', key: 'server_id', width: 80, align: 'center', render: (id?: number) => id != null ? <Tag color="purple">服务器{id}</Tag> : '-' },
    { title: '联盟名', dataIndex: 'name', key: 'name', width: 140, align: 'center', render: name => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span> },
    { title: '等级', dataIndex: 'lv', key: 'lv', width: 70, align: 'center', render: (v?: number) => <Tag color="green">{v ?? '-'}</Tag> },
    { title: '总战力', dataIndex: 'formatted_league_fightpoint', key: 'league_fightpoint', width: 120, align: 'center', render: fp => <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>{fp}</span> },
    { title: '人数', dataIndex: 'user_num', key: 'user_num', width: 100, align: 'center', render: (_: any, r) => <span style={{ fontWeight: 'bold' }}>{`${r.user_num ?? '-'} / ${r.num_max ?? '-'}`}</span> },
    { title: '盟主', dataIndex: 'leader_name', key: 'leader_name', width: 120, align: 'center', render: leader => <span style={{ color: '#722ed1' }}>{leader}</span> },
    { title: '资金', dataIndex: 'formatted_money', key: 'money', width: 120, align: 'center', render: money => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{money}</span> },
    { title: '宣言', dataIndex: 'manifesto', key: 'manifesto', width: 60, align: 'center', render: text => text ? (
        <Popover content={<div style={{ whiteSpace: 'pre-wrap', maxWidth: 240 }}>{text}</div>} trigger="click">
          <BookOutlined style={{ fontSize: 16, color: '#1890ff', cursor: 'pointer' }} />
        </Popover>
      ) : '-' },
  ];

  return (
    <Card 
      title={<Space><TeamOutlined/>联盟排行榜</Space>}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={()=>load(page)} loading={loading}>
            刷新
          </Button>
        </Space>
      }
    >
      <Table<LeagueRankingItem>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={(r)=>`${r.server_id}-${r.name}`}
        pagination={{ current: page, pageSize: settings.pageSize, total, showTotal: t=>`共 ${t} 条`, onChange: p=>load(p) }}
        scroll={{ x: 900 }}
        size="small"
        bordered
      />
    </Card>
  );
};

export default LeagueRankings;
