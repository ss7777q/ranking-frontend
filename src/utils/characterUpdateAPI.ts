import api from '../services/api';
import ApiResponseHandler from './apiResponseHandler';

// 角色属性更新API - 使用新的后端服务
export const updateCharacterAPI = async (uid: string) => {
  try {
    // 使用 axios 实例，拦截器会切换到 CHARACTER_API_BASE
    const response: any = await api.post<any, any>('/character/updatedetails', { uid });
    
    // 使用新的响应处理器，静默处理不显示自动消息
    const data = ApiResponseHandler.handleResponseSilent(response);
    
    return { data: data || {}, timestamp: response.timestamp, uid };
  } catch (error: any) {
    console.error('更新角色属性失败:', error);
    
    // 根据错误消息提供更友好的错误信息
    let errorMsg = '更新失败，请稍后重试';
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('未找到') || errorMessage.includes('角色数据')) {
      errorMsg = '角色不存在，请检查UID格式';
    } else if (errorMessage.includes('UID') || errorMessage.includes('格式')) {
      errorMsg = 'UID格式错误或无效';
    } else if (errorMessage.includes('数据库') || errorMessage.includes('浏览器')) {
      errorMsg = '服务暂时不可用，请稍后重试';
    }
    
    throw new Error(errorMsg);
  }
};
