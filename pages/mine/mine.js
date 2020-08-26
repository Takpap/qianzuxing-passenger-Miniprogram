// pages/mine/mine.js
var formatTime = require('../../utils/util')
var app = getApp()
var ctx;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    loginText: "退 出 登 录",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ctx = this
    let isLogin = wx.getStorageSync('isLogin')
    let userInfo = wx.getStorageSync('userInfo')
    let callName = wx.getStorageSync('callName')
    let phoneNumber = wx.getStorageSync('phoneNumber')
    // if (!userInfo || !phoneNumber) {
    if (!isLogin) {
      ctx.setData({
        loginText: "登 录"
      })
    } else {
      ctx.setData({
        isLogin: isLogin,
        userInfo: userInfo,
        callName: callName,
        phoneNumber: phoneNumber,
        loginText: "退 出 登 录"
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
  },
  tapBack() {
    wx.navigateBack();
  },
  tapLogin(e) {
    let callName = ctx.data.callName;
    let phoneNumber = ctx.data.phoneNumber;
    if (ctx.data.isLogin) {
      ctx.setData({
        isLogin: false,
        callName: '',
        phoneNumber: '',
        loginText: "登 录"
      })
      wx.clearStorage()
      return
    }
    if (ctx.checkPhone(phoneNumber) && phoneNumber) {
      console.log('电话号码输入正确')
      let userInfo;
      wx.showLoading({
        title: '请稍后',
        icon: "loading"
      })
      wx.getUserInfo({
        success: function (res) {
          ctx.setData({
            isLogin: true,
            userInfo: res.userInfo,
            loginText: "退 出 登 录"
          })
          wx.setStorageSync("userInfo", res.userInfo)
        }
      })
      wx.setStorageSync('callName', callName)
      wx.setStorageSync('phoneNumber', phoneNumber)
      wx.setStorageSync('isLogin', true)
      console.log(ctx.data.userInfo)
      wx.request({
        method:'POST',
        url: app.globalData.baseUrl + 'passengerLogin',
        data: {
          'callName':callName,
          'phoneNumber':phoneNumber,
          'userInfo': ctx.data.userInfo,
          'loginTime':formatTime.formatTime(new Date())
        },
        success(res){
          console.log(res)
        }
      })
      wx.hideLoading();
    } else {
      wx.showToast({
        title: '信息输入不正确',
        icon: "none"
      })
    }
  },
  bindgetuserinfoCallback(e) {
    // console.log(e.detail.rawData);
  },
  phoneInput(e) {
    ctx.setData({
      phoneNumber: e.detail.value
    })
  },
  callNamInput(e) {
    ctx.setData({
      callName: e.detail.value
    })
  },
  checkPhone(phone) {
    if (!(/^1[3456789]\d{9}$/.test(phone))) {
      return false;
    } else {
      return true;
    }
  }
})