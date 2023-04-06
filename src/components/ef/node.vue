<template>
  <div
    ref="node"
    :style="nodeContainerStyle"
    @click="clickNode"
    @mouseup="changeNodeSite"
    :class="nodeContainerClass"
  >
    <!-- 最左侧的那条竖线 -->
    <div class="ef-node-left"></div>
    <!-- 节点类型的图标 -->
    <div class="ef-node-left-ico flow-node-drag">
      <el-icon :class="nodeIcoClass">
        <Setting v-if="node.ico === 'setting'" :class="nodeIcoClass"/>
      </el-icon>
    </div>
    <!-- 节点名称 -->
    <div class="ef-node-text" :show-overflow-tooltip="true">
      {{node.name}}
    </div>
    <!-- 节点状态图标 -->
    <div class="ef-node-right-ico">
      <el-icon color="#33ff66" v-if="node.state === 'success'"><SuccessFilled /></el-icon>
      <el-icon color="#ff0000" v-if="node.state === 'error'"><CircleCloseFilled /></el-icon>
      <el-icon color="#ff9900" v-if="node.state === 'warning'"><WarningFilled /></el-icon>
      <el-icon class="is-loading" v-if="node.state === 'running'"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
const props = defineProps({
  node: {
    type: Object,
    default() {
      return {};
    },
  },
  activeElement: {
    type: Object,
    default() {
      return {};
    },
  },
});

let nodeContainerClass = computed(()=>{
  return {
    'ef-node-container': true,
    'ef-node-active': props.activeElement.type == 'node' ? props.activeElement.nodeId === props.node.id : false
  }
})
// 节点容器样式
let nodeContainerStyle = computed(()=>{
  return {
    top: props.node.top,
    left: props.node.left
  }
})

let nodeIcoClass = computed(()=>{
  var nodeIcoClass = {}
  nodeIcoClass[props.node.ico] = true
  // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
  nodeIcoClass['flow-node-drag'] = props.node.viewOnly ? false : true
  return nodeIcoClass
})

// 点击节点
function clickNode() {
  proxy.$emit('clickNode', props.node.id)
}

// 鼠标移动后抬起
function changeNodeSite() {
  // 避免抖动
  if (props.node.left == proxy.$refs.node.style.left && props.node.top == proxy.$refs.node.style.top) {
    return
  }
  proxy.$emit('changeNodeSite', {
    nodeId: props.node.id,
    left: proxy.$refs.node.style.left,
    top: proxy.$refs.node.style.top
  })
} 
</script>
