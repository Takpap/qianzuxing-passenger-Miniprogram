// pages/socket/socket.js
//获取应用实例
const app = getApp()
var ctx = this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: "123"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  bindGetUserInfo (e) {
    console.log(e.detail.userInfo)
  },
  tapLogin() {
    let phoneNumber = wx.getStorageSync('phoneNumber')
    if(!phoneNumber){
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  getPhoneNumber(res) {
    console.log(res)
  },
  tapLogin1() {
    var token = wx.getStorageSync('token')
    if (!token) {
      wx.login({
        success(res) {
          if (res.code) {
            //发起网络请求
            wx.request({
              url: app.globalData.baseUrl + 'getUserInfo',
              data: {
                code: res.code
              },
              success(res) {
                console.log(res)
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    } else {
      wx.checkSession({
        success() {
          //session_key 未过期，并且在本生命周期一直有效
          console.log(2)
        },
        fail() {
          // session_key 已经失效，需要重新执行登录流程
          //重新登录
          console.log(3)
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  tapBt() {
    wx.hideLoading({
      success: (res) => {
        console.log("loading hidding successful")
      },
    })
  },
  tapHide() {
    wx.showLoading({
      title: 'title',
    })
    setTimeout(() => {
      wx.hideLoading({
        success: (res) => {
          console.log("successful")
        },
      })

    }, 2000)

  },
  websocket() {
    let that = this
    wx.connectSocket({
      url: 'ws://192.168.3.218:8080',
      complete: (res) => {
        console.log(res)
      }
    })

    //连接成功
    wx.onSocketOpen(function () {
      wx.sendSocketMessage({
        data: that.data.value,
      })
    })

    //接收数据
    wx.onSocketMessage(function (data) {
      that.setData({
        resp: data.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})