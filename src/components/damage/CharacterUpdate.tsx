import React, { useState } from 'react';
import { Card, Form, InputNumber, Button, Row, Col, Typography, Input, message } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { updateCharacterAPI } from '../../utils/characterUpdateAPI';

const { Title, Text } = Typography;

interface CharacterUpdateProps {
  onBack: () => void;
}

interface PlayerData {
  lv?: number;
  atk?: number;
  def?: number;
  hp?: number;
  mp?: number;
  hitVal?: number;
  dodge?: number;
  crit?: number;
  tenacity?: number;
  lucky?: number;
  guardian?: number;
  break?: number;
  protect?: number;
  healHp?: number;
  healMp?: number;
  [key: string]: any;
}

const CharacterUpdate: React.FC<CharacterUpdateProps> = ({ onBack }) => {
  const [uid, setUid] = useState('');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateTime, setUpdateTime] = useState<string>('');

  const updateCharacter = async () => {
    if (!uid.trim()) {
      message.error('请输入有效的UID');
      return;
    }
    
    // 防止重复请求
    if (loading) return;
    
    setLoading(true);
    
    try {
      const result = await updateCharacterAPI(uid.trim());
      setPlayerData(result.data);
      setUpdateTime(new Date(result.timestamp).toLocaleString());
      message.success('角色属性更新成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateCharacter();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 20 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          style={{ marginRight: 16 }}
        >
          返回主页
        </Button>
        <Title level={3} style={{ display: 'inline' }}>角色属性更新</Title>
      </div>

      <Card title="更新角色属性" style={{ marginBottom: 20 }}>
        <Row gutter={16} align="bottom">
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <Text>玩家UID</Text>
            </div>
            <Input 
              placeholder="例如: 2018505912|4399|1" 
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              onKeyPress={handleKeyPress}
              size="large"
            />
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={updateCharacter}
              size="large"
              style={{ width: '100%' }}
            >
              {loading ? '更新中...' : '更新角色属性'}
            </Button>
          </Col>
        </Row>
      </Card>

      {playerData ? (
        <Card title="角色属性详情" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <Text><strong>UID:</strong> {uid}</Text>
            <br />
            <Text><strong>更新时间:</strong> {updateTime}</Text>
          </div>
          
          <Title level={5}>基础属性</Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>等级</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.lv || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>攻击</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.atk || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>防御</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.def || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>生命</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.hp || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>魔法</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.mp || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>命中</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.hitVal || 0}</div>
              </div>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>闪避</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.dodge || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>暴击</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.crit || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>韧性</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.tenacity || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>幸运</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.lucky || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>守护</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.guardian || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>穿透</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.break || 0}</div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>减伤</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.protect || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>回血</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.healHp || 0}</div>
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>回蓝</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{playerData.healMp || 0}</div>
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Title level={5}>使用说明：</Title>
            <Text>
              1. 输入玩家UID（格式：数字|平台|服务器，例如：2018505912|4399|1）<br />
              2. 点击"更新角色属性"按钮从服务器获取最新数据<br />
              3. 获取成功后会显示该玩家的完整属性信息<br />
              4. 属性数据可用于其他计算功能
            </Text>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <ReloadOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">暂无角色数据</Title>
            <Text type="secondary">请输入UID来获取角色属性</Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CharacterUpdate;
