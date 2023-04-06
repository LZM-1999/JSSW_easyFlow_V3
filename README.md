
# 是什么？

 - easyflow(流程图)的vue3版本
![在这里插入图片描述](https://img-blog.csdnimg.cn/48dd5dcec70c4b80bb75616527d4f8ff.png)
# 安装

```powershell
npm i easyflow-v3

import { createApp } from 'vue'
import App from './App'
import easyflow from 'easyflow-v3';

const app = createApp(App)
app.use(easyflow)
```

```javascript
package.json三项依赖，
"dependencies": {
    "vuedraggable": "^4.1.0",
    "lodash-es": "^4.17.21",
    "element-plus": "^2.2.6",
}
```

# 怎么用？
应用方面主要是两个组件：

 -  **<M-FlowPanel\> ：流程图选择界面**
***props属性：***
```javascript
 1. flowData：流程图的数组对象体(如上示例)
let flowData = reactive( 
	{ 
		"nodeList": [ 
			{ "id": "mlrgebavm1", "processId": "127", "name": "长晶", "left": "49px", "top": "249px", "ico": "el-icon-setting", "state": "success" }, 
			{ "id": "46ou058e", "processId": "135", "name": "方棒检验", "left": "643px", "top": "190px", "ico": "el-icon-setting", "state": "success" },
			{ "id": "s0mzc0652i", "processId": "132", "name": "开方", "left": "656px", "top": "327px", "ico": "el-icon-setting", "state": "success" }
		], 
		"lineList": [ 
			{ "from": "mlrgebavm1", "to": "46ou058e", "label": "加热", "paintStyle": { "strokeWidth": 2, "stroke": "#EE1414" } ,
			{ "from": "mlrgebavm1", "to": "s0mzc0652i", "label": "冷却", "paintStyle": { "strokeWidth": 2, "stroke": "#038BFB" } 	
		]
	}
)
2. selectList：左侧选择框内的列表项(如上示例)
let flowData = reactive([ { "open": true, "name": "在制品", "children": [ { "id": "127", "name": "长晶", "ico": "el-icon-setting", "disabled": false }, { "id": "128", "name": "送验", "ico": "el-icon-setting", "disabled": false }, { "id": "129", "name": "划线", "ico": "el-icon-setting", "disabled": false }, { "id": "130", "name": "截断", "ico": "el-icon-setting", "disabled": false }, { "id": "131", "name": "粘圆棒", "ico": "el-icon-setting", "disabled": false }, { "id": "132", "name": "开方", "ico": "el-icon-setting", "disabled": false }, { "id": "133", "name": "磨削", "ico": "el-icon-setting", "disabled": false }, { "id": "134", "name": "圆棒检验", "ico": "el-icon-setting", "disabled": false }, { "id": "135", "name": "方棒检验", "ico": "el-icon-setting", "disabled": false }, { "id": "137", "name": "打包", "ico": "el-icon-setting", "disabled": false }, { "id": "138", "name": "综计WMS", "ico": "el-icon-setting", "disabled": false } ] } ])
```

 -  **< M-ShowFlow \>：用来显示流程图最终预览效果**
***props属性：***
```javascript
 1. show-data：流程图的数组对象体(如上示例)
let flowData = reactive(
	{ 
		"nodeList": [ 
			{ "id": "mlrgebavm1", "processId": "127", "name": "长晶", "left": "49px", "top": "249px", "ico": "el-icon-setting", "state": "success" }, 
			{ "id": "46ou058e", "processId": "135", "name": "方棒检验", "left": "643px", "top": "190px", "ico": "el-icon-setting", "state": "success" },
			{ "id": "s0mzc0652i", "processId": "132", "name": "开方", "left": "656px", "top": "327px", "ico": "el-icon-setting", "state": "success" }
		], 
		"lineList": [ 
			{ "from": "mlrgebavm1", "to": "46ou058e", "label": "加热", "paintStyle": { "strokeWidth": 2, "stroke": "#EE1414" } ,
			{ "from": "mlrgebavm1", "to": "s0mzc0652i", "label": "冷却", "paintStyle": { "strokeWidth": 2, "stroke": "#038BFB" } 	
		]
	}
)
```



