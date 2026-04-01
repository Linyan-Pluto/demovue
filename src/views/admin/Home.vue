<template>
  <div class="admin-home">
    <!-- 1. 核心数据卡片区域 -->
    <div class="stats-card-wrapper">
      <el-card class="stat-card">
        <div class="card-title">今日订单总量</div>
        <div class="card-value">{{ Number(stats.todayOrderCount) || 0 }}</div>
        <div class="card-trend up" v-if="stats.orderTrend !== undefined">
          {{ Number(stats.orderTrend) > 0 ? '+' : '' }}{{ Number(stats.orderTrend).toFixed(2) }}% 较昨日
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-title">今日销售总量</div>
        <div class="card-value">{{ (Number(stats.todaySales) || 0).toFixed(2) }}</div>
        <div class="card-trend up" v-if="stats.salesTrend !== undefined">
          {{ Number(stats.salesTrend) > 0 ? '+' : '' }}{{ Number(stats.salesTrend).toFixed(2) }}% 较昨日
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-title">总商家数</div>
        <div class="card-value">{{ Number(stats.totalMerchant) || 0 }}</div>
        <div class="card-trend normal" v-if="stats.activeRate !== undefined">
          活跃商家：{{ Number(stats.activeMerchant) || 0 }}（{{ Number(stats.activeRate).toFixed(2) }}%）
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="card-title">总订单数</div>
        <div class="card-value">{{ Number(stats.totalOrder) || 0 }}</div>
        <div class="card-trend normal" v-if="stats.monthOrder !== undefined">
          本月累计：{{ Number(stats.monthOrder) || 0 }}
        </div>
      </el-card>
    </div>

    <!-- 2. 筛选+图表切换区 -->
    <div class="chart-wrapper">
      <!-- 时间筛选器 -->
      <div class="chart-filter">
        <el-select v-model="timeRange" @change="handleTimeChange">
          <el-option label="近7天" value="7d"></el-option>
          <el-option label="近30天" value="30d"></el-option>
          <el-option label="本月" value="month"></el-option>
        </el-select>
      </div>

      <!-- 图表切换标签页 -->
      <el-tabs v-model="activeTab" type="card" class="chart-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="销售额变化" name="sales"></el-tab-pane>
        <el-tab-pane label="订单变化" name="order"></el-tab-pane>
        <el-tab-pane label="TOP10销量分店" name="top10"></el-tab-pane>
      </el-tabs>

      <!-- 统一图表容器 -->
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <!-- AI 悬浮助手 -->
    <div class="ai-float-btn" @click="aiShow = true">🤖</div>

    <div class="ai-chat-panel" v-if="aiShow">
      <div class="chat-header">
        <span>数据智能助手</span>
        <button @click="aiShow = false">×</button>
      </div>
      <div class="chat-messages">
        <div v-for="(msg, idx) in aiMessages" :key="idx" :class="msg.role">
          {{ msg.content }}
        </div>
      </div>
      <div class="chat-input">
        <el-input v-model="aiInput" @keyup.enter="sendAiMessage" placeholder="问我数据相关的问题..." />
        <el-button @click="sendAiMessage" type="primary">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats, getDashboardChart, getDashboardTop10 } from '../../api/dashboard'
import request from '../../utils/request'

// 响应式变量 
const timeRange = ref('7d')
const activeTab = ref('sales')
const chartRef = ref(null)
let myChart = null
let resizeHandler = null

// 核心统计数据
const stats = ref({})

// AI 功能
const aiShow = ref(false)
const aiInput = ref('')
const aiMessages = ref([])

const sendAiMessage = async () => {
  if (!aiInput.value) return
  const userQuestion = aiInput.value

  const prompt = `
  这是饮品店的经营数据，请根据数据回答问题：
  - 今日订单：${stats.value.todayOrderCount || 0}
  - 今日销售额：${stats.value.todaySales || 0}
  - 总商家数：${stats.value.totalMerchant || 0}
  - 总订单数：${stats.value.totalOrder || 0}
  - 活跃商家：${stats.value.activeMerchant || 0}

  用户问题：${userQuestion}
  `

  aiMessages.value.push({ role: 'user', content: userQuestion })
  aiInput.value = ''

  try {
    // 加30秒超时
    const res = await request.post('/ai/chat', {
      content: prompt
    }, {
      timeout: 30000
    })

    aiMessages.value.push({ role: 'ai', content: res.data })
  } catch (e) {
    console.error("AI请求失败：", e)
    aiMessages.value.push({ role: 'ai', content: 'AI 服务暂时不可用' })
  }
}

// 接口请求函数
const fetchStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data.data || {}
  } catch (e) {
    console.error("获取统计数据失败：", e)
    stats.value = {}
  }
}

const fetchChartData = async (range) => {
  try {
    const res = await getDashboardChart(range)
    let rawData = res.data
    const chartData = rawData.data || { axisData: [], salesData: [], orderData: [] }
    return chartData
  } catch (e) {
    console.error("获取图表数据失败：", e)
    return { axisData: [], salesData: [], orderData: [] }
  }
}

const fetchTop10Data = async () => {
  try {
    const res = await getDashboardTop10()
    let rawData = res.data
    if (!Array.isArray(rawData)) {
      rawData = rawData.data || []
    }
    const top10Array = Array.isArray(rawData) ? rawData : []
    const top10Name = top10Array.map(item => item.top10Name || '未知分店')
    const top10Data = top10Array.map(item => Number(item.top10Data) || 0)
    return { top10Name, top10Data }
  } catch (e) {
    console.error("获取TOP10数据失败：", e)
    return { top10Name: [], top10Data: [] }
  }
}

//图表初始化
const initChart = async () => {
  // 清理旧实例
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (myChart) {
    myChart.dispose()
    myChart = null
  }

  // 等待DOM渲染完成
  await nextTick()
  const dom = chartRef.value
  if (!dom) {
    console.error("图表容器不存在！")
    return
  }

  // 初始化ECharts
  myChart = echarts.init(dom)
  // 监听窗口大小变化
  resizeHandler = () => {
    myChart?.resize()
  }
  window.addEventListener('resize', resizeHandler)

  // 基础配置
  const baseOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  }

  let option = {}
  if (activeTab.value === 'sales') {
    const chartData = await fetchChartData(timeRange.value)
    option = {
      ...baseOption,
      xAxis: { type: 'category', data: chartData.axisData || [] },
      yAxis: { type: 'value', name: '销售额（元）' },
      tooltip: { formatter: '{b}: ¥{c}' },
      series: [{
        name: '销售额',
        type: 'line',
        smooth: true,
        data: chartData.salesData || [],
        itemStyle: { color: '#409eff' }
      }]
    }
  } else if (activeTab.value === 'order') {
    const chartData = await fetchChartData(timeRange.value)
    option = {
      ...baseOption,
      xAxis: { type: 'category', data: chartData.axisData || [] },
      yAxis: { type: 'value', name: '订单数（单）' },
      tooltip: { formatter: '{b}: {c}单' },
      series: [{
        name: '订单数',
        type: 'line',
        smooth: true,
        data: chartData.orderData || [],
        itemStyle: { color: '#67c23a' }
      }]
    }
  } else if (activeTab.value === 'top10') {
    const { top10Name, top10Data } = await fetchTop10Data()
    option = {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: top10Name,
        axisLabel: { rotate: -15, fontSize: 12 }
      },
      yAxis: { type: 'value', name: '销售额（元）' },
      tooltip: { formatter: '{b}: ¥{c}' },
      series: [{
        name: '销售额',
        type: 'bar',
        data: top10Data,
        itemStyle: { color: '#f56c6c' }
      }]
    }
  }

  // 设置图表
  myChart.setOption(option)
}

// 事件处理
const handleTimeChange = async () => {
  await initChart()
}

const handleTabChange = async () => {
  await initChart()
}

// 生命周期
onMounted(async () => {
  await fetchStats()
  await initChart()
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})

watch(timeRange, handleTimeChange, { immediate: false })
watch(activeTab, handleTabChange, { immediate: true })

</script>

<style scoped>
.admin-home {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.stats-card-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.card-trend {
  font-size: 12px;
}
.card-trend.up {
  color: #67c23a;
}
.card-trend.down {
  color: #f56c6c;
}
.card-trend.normal {
  color: #999;
}

.chart-wrapper {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-tabs {
  --el-tabs-card-border-color: #e6e6e6;
  --el-tabs-active-color: #409eff;
  margin-bottom: 10px;
}

.chart-container {
  width: 100%;
  height: 400px;
  min-width: 300px;
}

.ai-float-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 60px;
  height: 60px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.ai-chat-panel {
  position: fixed;
  right: 30px;
  bottom: 100px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 9999;
}

.chat-header {
  padding: 15px;
  background: #409eff;
  color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.chat-messages > div {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.chat-messages > .user {
  background: #e8f3ff;
  color: #333;
  margin-left: auto;
}

.chat-messages > .ai {
  background: #f5f5f5;
  color: #333;
  margin-right: auto;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #eee;
  gap: 6px;
}

@media (max-width: 1200px) {
  .stats-card-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .stats-card-wrapper {
    grid-template-columns: 1fr;
  }
  .chart-container {
    height: 300px;
  }
}
</style>