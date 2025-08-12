import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, InputNumber, Select, Input, Button, message } from 'antd';
import { urgeAPI } from '../services/api';
import { UrgeResponse } from '../types';
import { SaveOutlined } from '@ant-design/icons';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [form] = Form.useForm();
  const [urgeCount, setUrgeCount] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave(values);
      message.success('设置已保存'); // 可以添加保存成功的提示
    }).catch((error) => {
      console.error('表单验证失败:', error);
      message.error('请检查输入内容');
    });
  };

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      useUnits: false,
      pageSize: 50,
      serverId: null // 确保 AppSettings 中有 serverId 字段，否则会报错
    };
    form.setFieldsValue(defaultSettings);
    onSave(defaultSettings);
    message.info('设置已恢复默认'); // 可以添加恢复默认的提示
  };

  // 获取今日催更人数
  useEffect(() => {
    urgeAPI.getCount()
      .then((res) => setUrgeCount(res.count))
      .catch(() => message.error('获取催更人数失败'));
  }, []);

  return (
    <div>
      <Card title="⚙️ 系统设置" extra={
        <Button type="link" onClick={handleReset}>
          恢复默认
        </Button>
      }>
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="数字显示格式"
            name="useUnits"
            valuePropName="checked"
            tooltip="启用后，大数字将显示为万/亿单位"
          >
            <Switch
              checkedChildren="万/亿"
              unCheckedChildren="原始数字"
            />
          </Form.Item>

          <Form.Item
            label="每页显示条数"
            name="pageSize"
            rules={[
              { required: true, message: '请选择每页显示条数' },
              { type: 'number', min: 10, max: 100, message: '每页显示条数应在10-100之间' }
            ]}
          >
            <Select style={{ width: 200 }}>
              <Select.Option value={10}>10 条/页</Select.Option>
              <Select.Option value={20}>20 条/页</Select.Option>
              <Select.Option value={50}>50 条/页</Select.Option>
              <Select.Option value={100}>100 条/页</Select.Option>
            </Select>
          </Form.Item>

          {/* 服务器筛选：支持26个服务器，可清除以查看全部 */}
          <Form.Item
            label="默认服务器"
            name="serverId"
          >
            <Select placeholder="请选择服务器" allowClear style={{ width: 200 }}>
              {Array.from({ length: 26 }, (_, i) => i + 1).map((id) => (
                <Select.Option key={id} value={id}>{`服务器${id}`}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              size="large"
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card> {/* 确保这个 Card 标签已闭合 */}

      <Card
        size="small"
        title="💡 使用说明"
        style={{ marginTop: 24, backgroundColor: '#f9f9f9' }}
      >
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>数字显示格式：</strong>启用后，大于1万的数字会显示为"1.5万"、"2.3亿"等格式</li>
          <li><strong>每页显示条数：</strong>控制表格每页显示的记录数，数值越大加载越慢</li>
          <li><strong>默认服务器筛选：</strong>设置后，所有页面默认只显示指定服务器的数据</li>
        </ul>
      </Card>

      <Card 
        size="small" 
        title="加入我们" 
        style={{ marginTop: 16, backgroundColor: '#f0f9ff' }}
      >
        <div style={{ 
          textAlign: 'center',
          padding: '16px 0'
        }}>
          <Button 
            type="primary" 
            size="large"
            style={{ 
              background: 'linear-gradient(45deg, #1890ff, #36cfc9)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              height: '40px',
              minWidth: '200px',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
            }}
            onClick={() => window.open('http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=2NNzCNFoywxaPNXVfticobeW_yCp7jwM&authKey=zo3XriILBPVx7Cza2WFsWEhiwlLdFI5k1Zgm7If6ssHEEnSLsqEoyI29SKekmNR6&noverify=0&group_code=513291473', '_blank')}
          >
             点击此按钮加入我们 - 数值研究所
          </Button>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#666', 
            fontSize: '12px' 
          }}>
            QQ群：513291473 | 游戏数值
          </p>
        </div>
      </Card> {/* 修正：在这里添加了缺失的 </Card> 标签 */}

      <Card title="🚀 催更与留言" style={{ marginTop: 24 }}>
        <p>今日催更人数：{urgeCount}</p>
        <div style={{ margin: '8px 0' }}>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={200}
            placeholder="请输入催更留言（最多200字符）"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </div>
        <Button
          type="primary"
          onClick={() => {
            urgeAPI.postUrge({ comment: comment.trim() })
              .then((res: UrgeResponse) => {
                if (res.success) {
                  setUrgeCount(res.count);
                  message.success('催更成功，谢谢您的反馈');
                  setComment('');
                }
              })
              .catch((err) => {
                const detail = err.response?.data?.detail;
                message.error(detail || '今日已提交催更请求');
              });
          }}
        >
          催更 +1
        </Button>
      </Card>
    </div>
  );
};

export default SettingsPanel;
