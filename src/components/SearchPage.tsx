import React, { useState } from 'react';
import { Card, Input, Button, Table, Space, Alert, Statistic, Row, Col, Tag, message, Popover } from 'antd';
import { SearchOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons';
import { searchAPI } from '../services/api';
import { AppSettings, SearchResponse, HeroRankingItem, GodWarRankingItem, LeagueRankingItem } from '../types';

interface SearchPageProps {
  settings: AppSettings;
}

const SearchPage: React.FC<SearchPageProps> = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setLoading(true);
    try {
      const result = await searchAPI.comprehensive({
        query: searchTerm.trim(),
        server_id: settings.serverId,
        use_units: settings.useUnits,
      });
      setSearchResults(result);
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const powerColumns = [
    {
      title: '排名',
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
      title: '玩家名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>
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
      dataIndex: 'lv',
      key: 'lv',
      width: 70,
      render: (lv: number) => <Tag color="green">{lv}</Tag>,
    },
    {
      title: '角色',
      dataIndex: 'character_name',
      key: 'character_name',
      width: 100,
    },
    {
      title: '公会',
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
      title: '服务器',
      dataIndex: 'server_id',
      key: 'server_id',
      width: 80,
      render: (serverId: number) => (
        <Tag color="purple">服务器{serverId}</Tag>
      ),
    },
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
  ];

  const petColumns = [
    {
      title: '排名',
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
      render: (lv: number) => <Tag color="green">{lv}</Tag>,
    },
    {
      title: '宠物昵称',
      dataIndex: 'pet_nickname',
      key: 'pet_nickname',
      width: 120,
      render: (nickname: string) => (
        <span style={{ color: '#fa8c16' }}>{nickname || '无昵称'}</span>
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
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
  ];

  const rideColumns = [
    {
      title: '排名',
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
      render: (lv: number) => <Tag color="green">{lv}</Tag>,
    },
    {
      title: '坐骑昵称',
      dataIndex: 'ride_nickname',
      key: 'ride_nickname',
      width: 120,
      render: (nickname: string) => (
        <span style={{ color: '#fa8c16' }}>{nickname || '无昵称'}</span>
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
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
  ];

  const heroColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 10 ? 'orange' : 'default'}>{rank}</Tag>
      ),
    },
    {
      title: '玩家名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>,
    },
    {
      title: '战力',
      dataIndex: 'formatted_score',
      key: 'formatted_score',
      width: 100,
      render: (score: string) => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span>,
    },
    {
      title: '本区排行',
      dataIndex: 'server_character_rank',
      key: 'server_character_rank',
      width: 100,
    },
    {
      title: '全服排行',
      dataIndex: 'character_global_rank',
      key: 'character_global_rank',
      width: 100,
    },
    {
      title: '角色',
      dataIndex: 'character_name',
      key: 'character_name',
      width: 100,
    },
    {
      title: '等级',
      dataIndex: 'lv',
      key: 'lv',
      width: 70,
      render: (lv: number) => <Tag color="green">{lv}</Tag>,
    },
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      render: (uid: string) => <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{uid}</span>,
    },
    {
      title: '服务器',
      dataIndex: 'server_id',
      key: 'server_id',
      width: 80,
      render: (sid: number) => <Tag color="purple">服务器{sid}</Tag>,
    },
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      render: (src: string) => <Tag color="blue">{src}</Tag>,
    },
  ];

  const godWarColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center' as const,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 10 ? 'orange' : 'default'}>{rank}</Tag>
      ),
    },
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      align: 'center' as const,
      render: (uid: string) => <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#722ed1' }}>{uid}</span>,
    },
    {
      title: '角色',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      align: 'center' as const,
      render: (name: string) => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{name}</span>,
    },
    {
      title: '联盟',
      dataIndex: 'league_name',
      key: 'league_name',
      width: 150,
      align: 'center' as const,
      render: (league: string) => <span style={{ color: '#1890ff' }}>{league || '无'}</span>,
    },
    {
      title: '地区',
      dataIndex: 'ip_area',
      key: 'ip_area',
      width: 120,
      align: 'center' as const,
      render: (area: string) => <span style={{ color: '#52c41a' }}>{area || '未知'}</span>,
    },
    {
      title: '战力',
      dataIndex: 'formatted_score',
      key: 'formatted_score',
      width: 120,
      align: 'center' as const,
      render: (score: string) => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{score}</span>,
    },
    {
      title: '等级',
      dataIndex: 'lv',
      key: 'lv',
      width: 80,
      align: 'center' as const,
      render: (lv: number) => <Tag color="green">{lv}</Tag>,
    },
    {
      title: '服务器',
      dataIndex: 'server_id',
      key: 'server_id',
      width: 80,
      align: 'center' as const,
      render: (serverId: number) => <Tag color="purple">服务器{serverId}</Tag>,
    },
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      align: 'center' as const,
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
  ];

  const leagueColumns = [
    {
      title: '全区排名',
      dataIndex: 'global_rank',
      key: 'global_rank',
      width: 80,
      align: 'center' as const,
      render: (rank: number) => (
        <Tag color={rank && rank <= 3 ? 'gold' : rank && rank <= 10 ? 'orange' : 'default'}>{rank}</Tag>
      ),
    },
    {
      title: '联盟名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'center' as const,
      render: (name: string) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</span>,
    },
    {
      title: '联盟等级',
      dataIndex: 'lv',
      key: 'lv',
      width: 100,
      align: 'center' as const,
      render: (lv: number) => <Tag color="green">{lv || 0}</Tag>,
    },
    {
      title: '联盟资金',
      dataIndex: 'formatted_money',
      key: 'formatted_money',
      width: 120,
      align: 'center' as const,
      render: (money: string) => <span style={{ color: '#fa8c16' }}>{money || '0'}</span>,
    },
    {
      title: '联盟战力',
      dataIndex: 'formatted_league_fightpoint',
      key: 'formatted_league_fightpoint',
      width: 120,
      align: 'center' as const,
      render: (fightpoint: string) => <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{fightpoint || '0'}</span>,
    },
    {
      title: '盟主',
      dataIndex: 'leader_name',
      key: 'leader_name',
      width: 120,
      align: 'center' as const,
      render: (leader: string) => <span style={{ color: '#722ed1' }}>{leader || '未知'}</span>,
    },
    {
      title: '人数',
      dataIndex: 'user_num',
      key: 'user_num',
      width: 100,
      align: 'center' as const,
      render: (userNum: number, record: LeagueRankingItem) => (
        <span>{userNum || 0}/{record.num_max || 0}</span>
      ),
    },
    {
      title: '宣言',
      dataIndex: 'manifesto',
      key: 'manifesto',
      width: 80,
      align: 'center' as const,
      render: (manifesto: string) => (
        <Popover
          content={
            <div style={{ maxWidth: 300, wordWrap: 'break-word' }}>
              {manifesto || '暂无宣言'}
            </div>
          }
          title="联盟宣言"
          trigger={['hover', 'click']}
        >
          <BookOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
        </Popover>
      ),
    },
    {
      title: '服务器',
      dataIndex: 'server_id',
      key: 'server_id',
      width: 80,
      align: 'center' as const,
      render: (serverId: number) => <Tag color="purple">服务器{serverId}</Tag>,
    },
    {
      title: '匹配方式',
      dataIndex: 'search_source',
      key: 'search_source',
      width: 100,
      align: 'center' as const,
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
  ];

  return (
    <div>
      <Card title="🔍 全局搜索功能">
        <Alert
          message="搜索说明"
          description={
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <p>排行榜只可通过下表中对应列为✓的项目搜到,搜索后会显示所有对应项为✓的符合搜索要求的榜单</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>排行榜</th><th>角色名</th><th>UID</th><th>联盟</th><th>宠物名</th><th>坐骑名</th><th>盟主名</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>战力榜</td><td>✓</td><td>✓</td><td>✓</td><td>×</td><td>×</td><td>×</td></tr>
                  <tr><td>宠物榜</td><td>✓</td><td>✓</td><td>×</td><td>✓</td><td>×</td><td>×</td></tr>
                  <tr><td>坐骑榜</td><td>✓</td><td>✓</td><td>×</td><td>×</td><td>✓</td><td>×</td></tr>
                  <tr><td>角色榜</td><td>✓</td><td>✓</td><td>×</td><td>×</td><td>×</td><td>×</td></tr>
                  <tr><td>神魔榜</td><td>✓</td><td>✓</td><td>×</td><td>×</td><td>×</td><td>×</td></tr>
                  <tr><td>联盟榜</td><td>×</td><td>×</td><td>✓</td><td>×</td><td>×</td><td>✓</td></tr>
                </tbody>
              </table>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
          <Input
            placeholder="请输入搜索关键词（支持名称、UID、联盟）..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            size="large"
          >
            搜索
          </Button>
        </Space.Compact>

        {searchResults && (
          <>
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="⚔️ 战力榜"
                    value={searchResults.power_results.length}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="🐾 宠物榜"
                    value={searchResults.pet_results.length}
                    valueStyle={{ color: '#fa541c' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="🐎 坐骑榜"
                    value={searchResults.ride_results.length}
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="⚡ 神魔榜"
                    value={searchResults.godwar_results?.length || 0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="🏰 联盟榜"
                    value={searchResults.league_results?.length || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="👑 角色榜"
                    value={searchResults.hero_results.length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="📊 总计结果"
                    value={searchResults.total_count}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="🔍 搜索关键词"
                    value={`"${searchTerm}"`}
                    valueStyle={{ color: '#666', fontSize: '14px' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 战力排行榜结果 */}
            <div className="search-result-section">
              <h3>⚔️ 战力排行榜结果</h3>
              {searchResults.power_results.length > 0 ? (
                <Table
                  columns={powerColumns}
                  dataSource={searchResults.power_results}
                  rowKey="uid"
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                  bordered
                />
              ) : (
                <Alert message="战力榜无匹配结果" type="info" />
              )}
            </div>

            {/* 宠物排行榜结果 */}
            <div className="search-result-section">
              <h3>🐾 宠物排行榜结果</h3>
              {searchResults.pet_results.length > 0 ? (
                <Table
                  columns={petColumns}
                  dataSource={searchResults.pet_results}
                  rowKey={(record) => `${record.uid}_${record.pet_name}`}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                  bordered
                />
              ) : (
                <Alert message="宠物榜无匹配结果" type="info" />
              )}
            </div>

            {/* 坐骑排行榜结果 */}
            <div className="search-result-section">
              <h3>🐎 坐骑排行榜结果</h3>
              {searchResults.ride_results.length > 0 ? (
                <Table
                  columns={rideColumns}
                  dataSource={searchResults.ride_results}
                  rowKey={(record) => `${record.uid}_${record.ride_name}`}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                  bordered
                />
              ) : (
                <Alert message="坐骑榜无匹配结果" type="info" />
              )}
            </div>

            {/* 神魔排行榜结果 */}
            {searchResults.godwar_results && (
              <div className="search-result-section">
                <h3>⚡ 神魔排行榜结果</h3>
                {searchResults.godwar_results.length > 0 ? (
                  <Table
                    columns={godWarColumns}
                    dataSource={searchResults.godwar_results}
                    rowKey={(record) => `${record.uid}_${record.server_id}`}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    size="small"
                    bordered
                  />
                ) : (
                  <Alert message="神魔榜无匹配结果" type="info" />
                )}
              </div>
            )}

            {/* 联盟排行榜结果 */}
            {searchResults.league_results && (
              <div className="search-result-section">
                <h3>🏰 联盟排行榜结果</h3>
                {searchResults.league_results.length > 0 ? (
                  <Table
                    columns={leagueColumns}
                    dataSource={searchResults.league_results}
                    rowKey={(record) => `${record.name}_${record.server_id}`}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    size="small"
                    bordered
                  />
                ) : (
                  <Alert message="联盟榜无匹配结果" type="info" />
                )}
              </div>
            )}

            {/* 角色排行榜结果 - 放在最后 */}
            <div className="search-result-section">
              <h3>👑 角色排行榜结果</h3>
              {searchResults.hero_results.length > 0 ? (
                <Table
                  columns={heroColumns}
                  dataSource={searchResults.hero_results as HeroRankingItem[]}
                  rowKey={(record) => `${record.uid}_${record.character_id}_${record.server_id}`}
                  rowClassName={(record) => record.search_source?.startsWith('全局') ? 'search-highlight' : ''}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="small"
                  bordered
                />
              ) : (
                <Alert message="角色榜无匹配结果" type="info" />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SearchPage;
