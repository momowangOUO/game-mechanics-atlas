# 高保真预期样张检查

阶段状态：`visual_baseline_complete`。这表示六种视觉基准已制作并检查，不表示网站功能已实现或生产验收完成。

采用人物方向来自用户聊天选择“凉宫春日：清晰赛璐璐”，追加反馈为“线条不够粗”。最终角色已通过内置image_gen进行定向加粗；提示词和资源哈希见 `design/image-prompts.json`。原创黑发女仆使用纸质档案与铅笔，未继续采用早期全息平板草案。

## 已交付基准

|样张|可编辑源文件|实际渲染|
|---|---|---|
|桌面首页|`design/home-desktop.html`|`design/previews/home-desktop.png`，1440px视口|
|手机首页|`design/home-mobile.html`|`design/previews/home-mobile.png`，390px视口|
|机制详情|`design/mechanic.html`|`design/previews/mechanic.png`|
|游戏案例|`design/game.html`|`design/previews/game.png`|
|搜索热度|`design/heat.html`|`design/previews/heat.png`|
|混合实验室|`design/lab.html`|`design/previews/lab.png`|

文字、表格、线框、图表与版式在HTML/CSS中可编辑。人物为独立透明PNG，不宣称人物图层可编辑。游戏封面区为原创抽象机制图形，不是官方封面。样张中的搜索与榜单数值明确为合成演示，正式实现必须改由领域引擎生成。

## 实际检查与修复

本机使用Playwright与已有Edge无头模式渲染六页；报告见 `design/previews/render-report.json`。六页图像均加载，无页面脚本错误，无文档级横向溢出。逐一打开六张PNG，检查标题、段落、主体图、关系示意与主要栏位。

|位置|观察问题|修复|复查|
|---|---|---|---|
|桌面首页角色顶部|初版人物高于容器，女仆头饰顶部被裁掉|角色显示高度从660px调整为620px|重新渲染，头饰完整|
|手机首页角色区|初版角色过高，与搜索区域过度重叠|显示高度改为380px，调整右侧位置|重新渲染，主体与搜索层级更清楚|
|热度趋势图坐标轴|开放SVG路径默认填充，出现黑色三角形|坐标轴组显式使用 `fill=none`|重新渲染，三角形消失|

## 后续实现对照

保留大幅角色、宋体式标题、深墨蓝底、暖白纸面、雾紫按钮、青色数据线、硬边窗口和细线网点。正式页面需要把样张中的导航、Tab、搜索、导入、图谱和实验结果接成真实功能；不能把样张里的静态示意当作已经完成的交互。

移动端核心功能采用底部导航、抽屉、Tab与实验室步骤，不以缩小桌面表格代替适配。最终动效、键盘、减弱动态、不同手机宽度和生产性能仍需正式网站阶段验证。
