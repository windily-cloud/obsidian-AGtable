# AGtable

一个用于增强本地表格的 obsidian 插件，提供更加友好的使用 markdown 表格的方式。该插件基于[ag-grid](https://github.com/ag-grid/ag-grid)构建。

该插件处于测试阶段，在某些特殊的文档结构内会破环当前md文档内容，如果发现有问题，可以在编辑模式使用ctrl+z快捷键撤销更改。

# 核心特性

- [x] 创建表格
  - [x] 使用命令创建表格
  - [x] 设置表格规模
- [x] 列
  - [x] 右键列名新建列
  - [x] 双击列名重命名列
  - [x] 右键列名删除列
  - [x] 左键拖动列名排序
- [x] 行
  - [x] 右键行新建行
  - [x] 右键行删除行
  - [x] 左键上下拖动行首小图标拖动行排序
- [x] 单元格操作
  - [x] 双击单元格修改单元格
- [x] 键盘操作
  - [x] tab键跳转到下一单元格
  - [x] enter键修改表格

# 使用方法

**创建新表格：**
1. 确保安装了该插件且打开了该插件
2. 使用ctrl+p选择创建表格，创建一个ag-table，此时可以操作表格了

**从旧表格转换：**
1. 左键框选选中markdown表格，须确保表格语法正确无误
2. 使用ctrl+p选择转换表格，如出现错误，将光标移入代码块，再移出来。或者重新打开该文件。
3. 操作表格。

# 安装方法

**obsidian社区安装：**
暂未上架社区商店

**手动安装：**
手动下载最新的压缩包，然后将其中的三个文件解压到 (main.js, manifest.json, styles.css) {{obsidian_vault}}/.obsidian/plugins/Obsidian-Agtable 文件夹即可.

**BRAT插件安装：**
安装BRAT插件：[点此安装](https://github.com/TfTHacker/obsidian42-brat)
在BART插件设置面板添加：`windily-cloud/obsidian-AGtable`

# 长期规划

- 单元格渲染md语法
- 单元格支持`[[]]`语法
- 支持简单的数据计算
- 支持多列和多行操作

# 已知问题

- [ ] md表格转agtable需要让光标进入代码块再出来

# 感谢
感谢群友@Cuman和@蚕子提供的想法和不厌其烦的测试，感谢ag-grid提供的高性能表格，感谢[admonition](https://github.com/valentine195/obsidian-admonition)插件提供的国际化代码，感谢[quickadd](https://github.com/chhoumann/quickadd)插件提供的模态框代码。

# 许可证

该插件使用 MIT 许可证。
