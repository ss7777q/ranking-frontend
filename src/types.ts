// 应用设置接口
export interface AppSettings {
  useUnits: boolean;
  pageSize: number;
  serverId: number | null;
}

// 统一API响应格式
export interface StandardResponse<T = any> {
  code: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  data?: T;
  timestamp: string;
}

// 标准数据接口
export interface Standards {
  phyDefStandard: { [level: string]: number };
  sixDimStandard: { [level: string]: number };
}

// 伤害计算结果接口
export interface DamageResult {
  defReduction: string;
  resReduction: string;
  totalReduction: string;
  finalDamage: string;
  originalDamage: number;
  effectiveDef?: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 战力排行榜项目
export interface PowerRankingItem {
  rank: number;
  filtered_rank?: number;
  name: string;
  score: number;
  formatted_score: string;
  fightpoint: number;
  formatted_fightpoint: string;
  lv: number;
  character_id: number;
  character_name: string;
  league_name: string;
  ip_area: string;
  uid: string;
  server_id: number;
  search_source?: string;
}

// 宠物排行榜项目
export interface PetRankingItem {
  rank: number;
  filtered_rank?: number;
  pet_name: string;
  pet_score: number;
  formatted_score: string;
  owner_level: number;
  pet_nickname: string;
  owner_name: string;
  pet_skin_name: string;
  uid: string;
  server_id: number;
  search_source?: string;
}

// 坐骑排行榜项目
export interface RideRankingItem {
  rank: number;
  filtered_rank?: number;
  ride_name: string;
  ride_score: number;
  formatted_score: string;
  ride_level: number;
  ride_nickname: string;
  owner_name: string;
  ride_skin_name: string;
  uid: string;
  server_id: number;
  search_source?: string;
}
// 角色排行榜项目
export interface HeroRankingItem {
  rank: number;
  server_rank: number;
  character_global_rank: number;
  name: string;
  score: number;
  formatted_score: string;
  fightpoint: number;
  formatted_fightpoint: string;
  lv: number;
  character_id: number;
  character_name: string;
  league_name: string;
  ip_area: string;
  uid: string;
  server_id: number;
  search_source?: string;
}

// 神魔排行榜项（神将/魔王）
export interface GodWarRankingItem {
  rank: number; // 使用全服排行
  server_rank: number;
  global_rank: number;
  name: string;
  score: number;
  formatted_score: string;
  fightpoint: number;
  formatted_fightpoint: string;
  lv: number;
  character_id?: number;
  character_name?: string;
  league_name?: string;
  ip_area?: string;
  uid: string;
  server_id: number;
}

// 联盟排行榜项
export interface LeagueRankingItem {
  server_id: number;
  server_rank: number;
  global_rank?: number;
  name: string; // 联盟名称
  lv?: number;
  league_fightpoint?: number;
  formatted_league_fightpoint?: string;
  user_num?: number;
  num_max?: number;
  money?: number;
  formatted_money?: string;
  leader_name?: string;
  manifesto?: string;
  week_liveness?: number;
  recommendation_time?: number;
  need_password?: number; // 0/1
  update_time?: string;
}

// 搜索响应
export interface SearchResponse {
  power_results: PowerRankingItem[];
  pet_results: PetRankingItem[];
  ride_results: RideRankingItem[];
  hero_results: HeroRankingItem[];
  godwar_results: GodWarRankingItem[];
  league_results: LeagueRankingItem[];
  total_count: number;
}

// 服务器统计
export interface ServerStats {
  total_players?: number;
  max_score?: number;
  avg_score?: number;
  unique_characters?: number;
  total_pets?: number;
  unique_pets?: number;
  total_rides?: number;
  unique_rides?: number;
}

// 角色/服务器选项
export interface SelectOption {
  id: number;
  name: string;
}

// 分布数据
export interface DistributionItem {
  name: string;
  count: number;
  pet_name?: string;
  ride_name?: string;
}

// 催更相关类型
export interface UrgeResponse {
  success: boolean;
  count: number;
}
