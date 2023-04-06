<template>
  <div>
    <div class="ef-node-form">
      <!-- <div class="ef-node-form-header">
        编辑
      </div> -->
      <div class="ef-node-form-body" style="margin-top: 0px;padding-bottom: 0px;padding-top: 10px;height:160ZZpx">
        <el-form :model="node" ref="dataForm" label-width="40px" v-show="type === 'node'">
          <el-form-item label="名称">
            <el-input v-model="node.name" disabled></el-input>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" icon="el-icon-check" @click="save" >保存</el-button>
          </el-form-item> -->
        </el-form>

        <el-form :model="line" ref="dataForm" label-width="40px" v-show="type === 'line'" >
          <el-form-item label="条件" style="margin-bottom: 2px;">
            <el-input v-model="line.label"></el-input>
          </el-form-item>
          <el-form-item label="宽度" style="margin-bottom: 2px;">
            <el-radio-group v-model="line.strokeWidth">
              <el-radio style="margin-right: 10px;" :label="2">默认</el-radio>
              <el-radio style="margin-right: 10px;" :label="3">粗</el-radio>
              <el-radio style="margin-right: 10px;" :label="1">细</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="颜色" style="height: 33px;margin-bottom: 2px;">
            <el-color-picker v-model="line.stroke" :predefine="predefineColors"></el-color-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-check" @click="saveLine">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--            <div class="el-node-form-tag"></div>-->
    </div>
  </div>

</template>

<script>
  import { cloneDeep } from 'lodash-es'

  const defaultLine = {
    label: '',
    stroke: '',
    strokeWidth: ''
  }
  export default {
    data() {
      return {
        visible: true,
        // node 或 line
        type: 'node',
        node: {},
        line: Object.assign({}, defaultLine),
        data: {},
        predefineColors: [
          '#67C23A',
          '#E6A23C',
          '#F56C6C',
          '#909399'
        ]
      }
    },
    methods: {
      /**
       * 表单修改，这里可以根据传入的ID进行业务信息获取
       * @param data
       * @param id
       */
      nodeInit(data, id) {
        this.type = 'node'
        this.data = data
        data.nodeList.filter((node) => {
          if (node.id === id) {
            this.node = cloneDeep(node)
          }
        })
      },
      lineInit(line) {
        this.type = 'line'
        this.line = Object.assign(defaultLine, line)
      },
      // 修改连线
      saveLine() {
        const { strokeWidth, stroke } = this.line
        this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label, { strokeWidth, stroke })
      },
      save() {
        this.data.nodeList.filter((node) => {
          if (node.id === this.node.id) {
            node.name = this.node.name
            node.left = this.node.left
            node.top = this.node.top
            node.ico = this.node.ico
            this.$emit('repaintEverything')
          }
        })
      }
    }
  }
</script>

<style>
  .el-node-form-tag {
    position: absolute;
    top: 50%;
    margin-left: -15px;
    height: 40px;
    width: 15px;
    background-color: #fbfbfb;
    border: 1px solid rgb(220, 227, 232);
    border-right: none;
    z-index: 0;
  }
</style>
