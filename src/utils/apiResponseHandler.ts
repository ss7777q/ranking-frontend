import { message } from 'antd';
import { StandardResponse } from '../types';

/**
 * 统一API响应处理工具
 * 处理新的标准化响应格式，提供统一的成功/错误处理
 */
export class ApiResponseHandler {
  /**
   * 处理API响应
   * @param response 标准化API响应
   * @param showMessage 是否显示消息提示，默认为true
   * @returns 成功时返回数据，失败时抛出错误
   */
  static handleResponse<T>(
    response: StandardResponse<T>, 
    showMessage: boolean = true
  ): T {
    const { code, message: msg, data } = response;

    switch (code) {
      case 'SUCCESS':
        if (showMessage) {
          message.success(msg);
        }
        return data as T;
        
      case 'WARNING':
        if (showMessage) {
          message.warning(msg);
        }
        return data as T;
        
      case 'INFO':
        if (showMessage) {
          message.info(msg);
        }
        return data as T;
        
      case 'ERROR':
        if (showMessage) {
          message.error(msg);
        }
        throw new Error(msg);
        
      default:
        const errorMsg = `未知的响应状态码: ${code}`;
        if (showMessage) {
          message.error(errorMsg);
        }
        throw new Error(errorMsg);
    }
  }

  /**
   * 处理API响应（静默模式，不显示消息）
   * @param response 标准化API响应
   * @returns 成功时返回数据，失败时抛出错误
   */
  static handleResponseSilent<T>(response: StandardResponse<T>): T {
    return ApiResponseHandler.handleResponse(response, false);
  }

  /**
   * 检查响应是否成功
   * @param response 标准化API响应
   * @returns 是否成功
   */
  static isSuccess(response: StandardResponse): boolean {
    return response.code === 'SUCCESS';
  }

  /**
   * 检查响应是否失败
   * @param response 标准化API响应
   * @returns 是否失败
   */
  static isError(response: StandardResponse): boolean {
    return response.code === 'ERROR';
  }

  /**
   * 获取响应消息的颜色类型（用于UI显示）
   * @param code 响应状态码
   * @returns Ant Design消息类型
   */
  static getMessageType(code: string): 'success' | 'error' | 'warning' | 'info' {
    switch (code) {
      case 'SUCCESS':
        return 'success';
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * 格式化错误信息用于显示
   * @param error 错误对象
   * @returns 格式化后的错误消息
   */
  static formatError(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return '请求失败，请稍后重试';
  }
}

/**
 * 兼容旧响应格式的工具函数
 * 用于处理尚未适配新格式的API响应
 */
export class LegacyApiHandler {
  /**
   * 将旧格式响应转换为新格式
   * @param response 旧格式响应
   * @returns 新格式响应
   */
  static convertToStandardResponse<T>(response: any): StandardResponse<T> {
    // 如果已经是新格式，直接返回
    if (response.code && response.message !== undefined) {
      return response as StandardResponse<T>;
    }

    // 处理旧的 {success, data, error} 格式
    if (response.success !== undefined) {
      return {
        code: response.success ? 'SUCCESS' : 'ERROR',
        message: response.success ? '操作成功' : (response.error || '操作失败'),
        data: response.data,
        timestamp: new Date().toISOString()
      };
    }

    // 处理直接返回数据的情况
    return {
      code: 'SUCCESS',
      message: '操作成功',
      data: response,
      timestamp: new Date().toISOString()
    };
  }
}

export default ApiResponseHandler;
