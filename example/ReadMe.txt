1.<FLYER-scroll></FLYER-scroll> can be replaced 
search file lib/scroll.js -line4
2 HOOK
  2.1  @pullUpCB 上拉回调[function]
  2.2  @pullDownCB 下拉刷新[function]
  2.3  @scrollHandle 滚动距离[function]
  2.4  :options 基础配置[JSON-OBJECT]
  2.5  :data 显示主体数据[OBJECT]
  2.6  :error 请求错误返回的错误信息[OBJECT]

options {
  pullDownRefresh: {
    threshold: Number|50[default]|required
    stop: Number|40[default]|required
    stopTime: Number|1000[default]|unRequired
    txt: {
      loading: String|'正在刷新'[default]|unRequired
      timeout: String|'请求超时,请重试'[default]|unRequired
      fail: String|'请求失败,请重试'[default]|unRequired
      success: String|'刷新成功'[default]|unRequired
      start: String|'下拉刷新'[default]|unRequired
      end: String|'松开刷新'[default]|unRequired 
    }
  }
  pullUpLoad: {
    threshold: Number|-50[default]|required
    txt: {
      more: String|'上拉加载'[default]|unRequired
      noMore: String|'已无更多信息'[default]|unRequired
      timeout: String|'请求超时,请重试'[default]|unRequired
      fail: String|'请求失败,请重试'[default]|unRequired
      loading: String|'正在加载'[default]|unRequired
    }
  }
}
dom结构
<FLYER-scroll>
  <template></template>
  <template slot='pullDown' slot-scope='parent'>
    //state
    //parent.pullDownState.before 
    //parent.pullDownState.now  
    //parent.pullDownState.after
    //parent.pullDownState.fail
    //parent.pullDownState.timeout
  </template>
  <template slot='pullUp' slot-scope='parent'>
    //state
    //parent.pullUpState.before
    //parent.pullUpState.now
    //parent.pullUpState.fail
    //parent.pullUpState.timeout
  </template>
</FLYER-scroll>
template slot='pullDown'和template slot='pullUp'默认可不填写

细节
1 插件默认有一套刷新和加载的标签,只有把options的required选项填完就可以运行
2 本插件提供2种修改刷新和加载的方式
2.1 options内部修改默认的刷新和加载值
2.2 template 直接修改整个刷新和加载流程
注意: 方法2会直接修改整体结构,1和2无需一起使用.使用方法2时,options下的txt可置空
3 如果使用vue的懒加载模式,那么自定义标签<FLYER-scroll/>的父级标签一定要有height属性高度,
例 {position:absolute,left:0,right:0,top:0,bottom:0}这种是无效的
{position:absolute,left:0,right:0,top:0,bottom:0,height:100%}也是无效的
height属性值必须是200px或者calc(100vh-100px)这种,不能使用百分比
