import axios from 'axios';
import { 
  PaginatedResponse, 
  PowerRankingItem, 
  PetRankingItem, 
  RideRankingItem,
  HeroRankingItem,
  SearchResponse,
  ServerStats,
  SelectOption,
  DistributionItem,
  UrgeResponse,
  StandardResponse,
  GodWarRankingItem,
  LeagueRankingItem
} from '../types';
import ApiResponseHandler, { LegacyApiHandler } from '../utils/apiResponseHandler';

// 支持多后端: 战力排行榜和角色信息
const RANKING_API_BASE = process.env.REACT_APP_RANKING_API_BASE_URL || 'http://47.105.122.202:8000/api';
const CHARACTER_API_BASE = process.env.REACT_APP_CHARACTER_API_BASE_URL || 'http://47.105.122.202:8002/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: RANKING_API_BASE,
  timeout: 30000,
});

// 请求拦截器：根据 URL 动态切换 baseURL
api.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/character')) {
      // 角色信息相关接口走 CHARACTER_API_BASE
      config.baseURL = CHARACTER_API_BASE;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应格式
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    
    // 对于 /character 开头的请求，预期返回新的统一格式
    if (response.config.url?.startsWith('/character')) {
      // 如果是标准化响应格式，直接返回
      if (data.code && data.message !== undefined) {
        return data;
      }
      // 如果不是标准格式，转换一下
      return LegacyApiHandler.convertToStandardResponse(data);
    }
    
    // 其他API保持原有处理方式
    return data;
  },
  (error) => {
    console.error('API 请求失败:', error);
    
    // 为角色相关API返回标准错误格式
    if (error.config?.url?.startsWith('/character')) {
      const errorResponse: StandardResponse<null> = {
        code: 'ERROR',
        message: ApiResponseHandler.formatError(error),
        data: null,
        timestamp: new Date().toISOString()
      };
      return Promise.resolve(errorResponse);
    }
    
    return Promise.reject(error);
  }
);

// 战力排行榜 API
export const powerAPI = {
  // 获取战力排行榜
  getRankings: (params: {
    page?: number;
    page_size?: number;
    server_id?: number | null;
    character_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<PowerRankingItem>> => {
    return api.get('/power/rankings', { params });
  },

  // 获取战力统计
  getStats: (server_id?: number | null): Promise<ServerStats> => {
    return api.get('/power/stats', { params: { server_id } });
  },
};

// 宠物排行榜 API
export const petAPI = {
  // 获取宠物排行榜
  getRankings: (params: {
    page?: number;
    page_size?: number;
    server_id?: number | null;
    pet_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<PetRankingItem>> => {
    return api.get('/pet/rankings', { params });
  },

  // 获取宠物统计
  getStats: (server_id?: number | null): Promise<ServerStats> => {
    return api.get('/pet/stats', { params: { server_id } });
  },

  // 获取宠物分布
  getDistribution: (server_id?: number | null): Promise<DistributionItem[]> => {
    return api.get('/pet/distribution', { params: { server_id } });
  },

  // 获取宠物类型
  getTypes: (): Promise<SelectOption[]> => {
    return api.get('/pet/types');
  },
};

// 坐骑排行榜 API
export const rideAPI = {
  // 获取坐骑排行榜
  getRankings: (params: {
    page?: number;
    page_size?: number;
    server_id?: number | null;
    ride_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<RideRankingItem>> => {
    return api.get('/ride/rankings', { params });
  },

  // 获取坐骑统计
  getStats: (server_id?: number | null): Promise<ServerStats> => {
    return api.get('/ride/stats', { params: { server_id } });
  },

  // 获取坐骑分布
  getDistribution: (server_id?: number | null): Promise<DistributionItem[]> => {
    return api.get('/ride/distribution', { params: { server_id } });
  },

  // 获取坐骑类型
  getTypes: (): Promise<SelectOption[]> => {
    return api.get('/ride/types');
  },
};
// 角色排行榜 API
export const heroAPI = {
  // 获取指定角色区服排行榜
  getRankings: (params: {
    page?: number;
    page_size?: number;
    server_id?: number | null;
    character_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<HeroRankingItem>> => {
    return api.get('/hero/rankings', { params });
  },
  // 获取全角色全服全局排行榜
  getAllRankings: (params: {
    page?: number;
    page_size?: number;
    use_units?: boolean;
  }): Promise<PaginatedResponse<HeroRankingItem>> => {
    return api.get('/hero/all-rankings', { params });
  },
  // 获取角色全局排行榜最新统计时间
  getUpdateTime: (): Promise<{ update_time: string }> => {
    return api.get('/hero/update-time');
  },
};

// 搜索 API
export const searchAPI = {
  // 综合搜索
  comprehensive: (params: {
    query: string;
    server_id?: number | null;
    use_units?: boolean;
  }): Promise<SearchResponse> => {
    return api.get('/search', { params });
  },
};

// 配置 API
export const configAPI = {
  // 获取角色列表
  getCharacters: (): Promise<SelectOption[]> => {
    return api.get('/config/characters');
  },

  // 获取服务器列表
  getServers: (): Promise<SelectOption[]> => {
    return api.get('/config/servers');
  },
};

// 健康检查
export const healthCheck = (): Promise<{ status: string; timestamp: string }> => {
  return api.get('/health');
};

// 催更 API
export const urgeAPI = {
  // 提交催更请求，直接返回 UrgeResponse
  postUrge: (data: { comment: string }): Promise<UrgeResponse> =>
    api.post<any, UrgeResponse>('/urge', data),
  getCount: (): Promise<{ count: number }> =>
    api.get<any, { count: number }>('/urge/count'),
};

// 系统战力 API
export const systemPowerAPI = {
  // 查询系统战力信息
  getSystemPower: (uid: string): Promise<StandardResponse<any>> => {
    return api.post('/character/systempower', { uid });
  },
  
  // 更新系统战力信息
  updateSystemPower: (uid: string): Promise<StandardResponse<any>> => {
    return api.post('/character/updatesystempower', { uid });
  },

  // 查询角色详情
  getCharacterDetails: (uid: string): Promise<StandardResponse<any>> => {
    return api.post('/character/details', { uid });
  },

  // 更新角色详情
  updateCharacterDetails: (uid: string): Promise<StandardResponse<any>> => {
    return api.post('/character/updatedetails', { uid });
  },
};

// 神魔排行榜 API
export const godWarAPI = {
  getRankings: (params: {
    page?: number;
    page_size?: number;
    type?: 'plunder' | 'devil';
    server_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<GodWarRankingItem>> => {
    return api.get('/godwar/rankings', { params });
  },
};

// 联盟排行榜 API
export const leagueAPI = {
  getRankings: (params: {
    page?: number;
    page_size?: number;
    server_id?: number | null;
    use_units?: boolean;
  }): Promise<PaginatedResponse<LeagueRankingItem>> => {
    return api.get('/league/rankings', { params });
  },
};

export default api;
