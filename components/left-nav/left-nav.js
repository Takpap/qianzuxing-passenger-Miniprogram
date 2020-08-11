// components/navBar/navBar.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  options:{
    multipleSlots: true
  },
  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight:0,
    open: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tapMenu:function(){
      console.log(this.data.open)
      this.setData({open:!this.data.open})
    }
    
  },
  attached:function(){
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })
  }
})
