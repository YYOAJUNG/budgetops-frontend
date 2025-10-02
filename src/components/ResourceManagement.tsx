import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Server, 
  Database, 
  HardDrive, 
  Wifi, 
  Play, 
  Square, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { trackButtonClick } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface ResourceManagementProps {
  onNavigate: (page: string) => void;
}

export function ResourceManagement({ onNavigate }: ResourceManagementProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');

  // Mock data
  const resources = [
    {
      id: 'ec2-001',
      name: 'Web Server 01',
      type: 'EC2 Instance',
      provider: 'AWS',
      status: 'running',
      cpu: 45,
      memory: 67,
      storage: 23,
      network: 12,
      cost: '$15.50/월',
      region: 'us-east-1',
      uptime: '15일 3시간'
    },
    {
      id: 'vm-002',
      name: 'Database Server',
      type: 'Virtual Machine',
      provider: 'Azure',
      status: 'running',
      cpu: 78,
      memory: 89,
      storage: 45,
      network: 28,
      cost: '$23.40/월',
      region: 'eastus',
      uptime: '8일 12시간'
    },
    {
      id: 'gce-003',
      name: 'App Server',
      type: 'Compute Engine',
      provider: 'GCP',
      status: 'stopped',
      cpu: 0,
      memory: 0,
      storage: 15,
      network: 0,
      cost: '$0.00/월',
      region: 'us-central1',
      uptime: '0일 0시간'
    },
    {
      id: 'rds-004',
      name: 'User Database',
      type: 'RDS Instance',
      provider: 'AWS',
      status: 'running',
      cpu: 32,
      memory: 54,
      storage: 67,
      network: 8,
      cost: '$18.90/월',
      region: 'us-west-2',
      uptime: '22일 7시간'
    },
    {
      id: 's3-005',
      name: 'Static Assets',
      type: 'S3 Bucket',
      provider: 'AWS',
      status: 'active',
      cpu: 0,
      memory: 0,
      storage: 89,
      network: 45,
      cost: '$5.20/월',
      region: 'us-east-1',
      uptime: '365일+'
    }
  ];

  const usageHistory = [
    { time: '00:00', cpu: 25, memory: 45, network: 12 },
    { time: '04:00', cpu: 35, memory: 52, network: 18 },
    { time: '08:00', cpu: 65, memory: 68, network: 35 },
    { time: '12:00', cpu: 78, memory: 75, network: 45 },
    { time: '16:00', cpu: 82, memory: 80, network: 38 },
    { time: '20:00', cpu: 45, memory: 58, network: 22 },
  ];

  const aiInsights = [
    {
      resource: 'gce-003',
      type: 'cost_optimization',
      message: '이 인스턴스가 7일째 중지 상태입니다. 제거를 고려해보세요.',
      impact: 'high',
      savings: '$12/월'
    },
    {
      resource: 'vm-002',
      type: 'performance',
      message: 'CPU 사용률이 지속적으로 높습니다. 업그레이드를 권장합니다.',
      impact: 'medium',
      savings: null
    },
    {
      resource: 'ec2-001',
      type: 'efficiency',
      message: '리소스 사용률이 낮습니다. 더 작은 인스턴스로 다운그레이드 가능합니다.',
      impact: 'medium',
      savings: '$8/월'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === 'all' || resource.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '실행 중';
      case 'stopped': return '중지됨';
      case 'active': return '활성';
      default: return '알 수 없음';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'AWS': return 'bg-orange-100 text-orange-700';
      case 'Azure': return 'bg-blue-100 text-blue-700';
      case 'GCP': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리소스 관리</h1>
          <p className="text-gray-600 mt-1">모든 클라우드 리소스를 한곳에서 관리하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <SurveyButton variant="outline" size="md" textType="short" />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => trackButtonClick('refresh_resources', 'Action', 'resources')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              trackButtonClick('ai_analysis', 'Navigation', 'resources');
              onNavigate('ai');
            }}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI 분석
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 리소스</p>
                <p className="text-xl font-bold text-gray-900">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">실행 중</p>
                <p className="text-xl font-bold text-gray-900">
                  {resources.filter(r => r.status === 'running' || r.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">중지됨</p>
                <p className="text-xl font-bold text-gray-900">
                  {resources.filter(r => r.status === 'stopped').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI 인사이트</p>
                <p className="text-xl font-bold text-gray-900">{aiInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="리소스 이름 또는 타입으로 검색..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      trackButtonClick('search_resources', 'Search', 'resources', {
                        search_term: e.target.value
                      });
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select 
              value={filterProvider} 
              onValueChange={(value) => {
                setFilterProvider(value);
                trackButtonClick('filter_provider', 'Filter', 'resources', {
                  filter_value: value
                });
              }}
            >
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="프로바이더 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 프로바이더</SelectItem>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Azure">Azure</SelectItem>
                <SelectItem value="GCP">GCP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>리소스 목록</CardTitle>
              <CardDescription>
                {filteredResources.length}개의 리소스가 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3 p-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedResource === resource.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      trackButtonClick('select_resource', 'Resource', 'resources', {
                        resource_name: resource.name,
                        resource_type: resource.type,
                        resource_provider: resource.provider
                      });
                      setSelectedResource(resource.id);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)}`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{resource.name}</h3>
                          <p className="text-sm text-gray-600">{resource.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getProviderColor(resource.provider)}>
                          {resource.provider}
                        </Badge>
                        <Badge variant="outline">
                          {getStatusText(resource.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CPU</p>
                        <div className="flex items-center gap-2">
                          <Progress value={resource.cpu} className="flex-1 h-2" />
                          <span className="text-sm text-gray-600">{resource.cpu}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">메모리</p>
                        <div className="flex items-center gap-2">
                          <Progress value={resource.memory} className="flex-1 h-2" />
                          <span className="text-sm text-gray-600">{resource.memory}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">스토리지</p>
                        <div className="flex items-center gap-2">
                          <Progress value={resource.storage} className="flex-1 h-2" />
                          <span className="text-sm text-gray-600">{resource.storage}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">네트워크</p>
                        <div className="flex items-center gap-2">
                          <Progress value={resource.network} className="flex-1 h-2" />
                          <span className="text-sm text-gray-600">{resource.network}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{resource.cost}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Resource Details */}
          {selectedResource && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">리소스 상세</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const resource = resources.find(r => r.id === selectedResource);
                  if (!resource) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">{resource.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">타입:</span>
                            <span>{resource.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">프로바이더:</span>
                            <Badge variant="outline" className={getProviderColor(resource.provider)}>
                              {resource.provider}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">지역:</span>
                            <span>{resource.region}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">상태:</span>
                            <Badge variant="outline">
                              {getStatusText(resource.status)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">비용:</span>
                            <span className="font-medium">{resource.cost}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">24시간 사용률</h4>
                        <ResponsiveContainer width="100%" height={120}>
                          <AreaChart data={usageHistory}>
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Tooltip 
                              formatter={(value, name) => [`${value}%`, name === 'cpu' ? 'CPU' : name === 'memory' ? '메모리' : '네트워크']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="cpu" 
                              stroke="#3b82f6" 
                              fill="#dbeafe" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        {resource.status === 'running' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => trackButtonClick('stop_resource', 'Resource Action', 'resources', {
                              resource_name: resource.name
                            })}
                          >
                            <Square className="w-3 h-3 mr-1" />
                            중지
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => trackButtonClick('start_resource', 'Resource Action', 'resources', {
                              resource_name: resource.name
                            })}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            시작
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => trackButtonClick('resource_more_actions', 'Resource Action', 'resources', {
                            resource_name: resource.name
                          })}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI 인사이트
              </CardTitle>
              <CardDescription>리소스 최적화 제안</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((insight, index) => {
                const resource = resources.find(r => r.id === insight.resource);
                return (
                  <div key={index} className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{resource?.name}</h4>
                      {insight.savings && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          {insight.savings}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        trackButtonClick('ai_insight_detail', 'AI', 'resources', {
                          insight_type: insight.type,
                          resource_id: insight.resource
                        });
                        onNavigate('ai');
                      }}
                    >
                      자세히 보기
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}