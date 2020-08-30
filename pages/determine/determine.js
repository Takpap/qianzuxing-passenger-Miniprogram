var ctx
var app = getApp()
let interal
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var md5Util = require('../../utils/md5.js')
var formatTime = require('../../utils/util')
// 实例化API核心类
const qqMapWX = new QQMapWX({
  key: 'ZOKBZ-UTIH3-IDI36-3LEBF-GQZ5Z-D5BYI'
})
var orderId;
var updateMarks;
var timeOut;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btText: "立即打车",
    showLoading: false,
    haveDriver: false,
    second: 1,
    passengers: 0,
    select: false,
    longitude: 107.454958,
    latitude: 26.884335,
    markers: [{
        iconPath: "/images/starting.png",
        id: 0,
        latitude: '',
        longitude: '',
        rotate: 0,
        zIndex: 999,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      },
      {
        iconPath: "/images/destination.png",
        id: 1,
        latitude: '',
        longitude: '',
        rotate: 0,
        zIndex: 999,
        anchor: {
          x: 0.5,
          y: 0.5
        }
      },
      {
        iconPath: "/images/carer.png",
        id: 2,
        latitude: 26.884431,
        longitude: 107.454899,
        rotate: 0,
        anchor: {
          x: 0.5,
          y: 0.5
        },
      }
    ]
  },
  //生命周期函数
  onLoad: function (options) {
    ctx = this
    this.setData({
      selectOne: true,
      passengers: 1,
      startLat: options.startLat,
      startLon: options.startLon,
      startTitle: options.startTitle,
      destLat: options.destLat,
      destLon: options.destLon,
      destTitle: options.destTitle,
      ['markers[0].latitude']: options.startLat,
      ['markers[0].longitude']: options.startLon,
      ['markers[1].latitude']: options.destLat,
      ['markers[1].longitude']: options.destLon,
      points: [{
          latitude: options.startLat,
          longitude: options.startLon
        },
        {
          latitude: options.destLat,
          longitude: options.destLon
        },
      ]
    })
    this.getPolyline()
  },
  //
  onHide: function () {
    clearInterval(updateMarks)
  },
  //获取路线
  getPolyline() {
    var start = {},
      dest = {}
    start.latitude = this.data.startLat
    start.longitude = this.data.startLon
    dest.latitude = this.data.destLat
    dest.longitude = this.data.destLon
    //调用距离计算接口
    qqMapWX.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: start,
      to: dest,
      policy: 'LEAST_FEE',
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        ctx.setData({
          polyline: [{
            points: pl,
            color: '#3b6978',
            width: 4
          }]
        })
      },
      fail: function (error) {
        console.error(error);
      }
    });
  },
  //设置选中乘车人数
  countTap: function (e) {
    var current = e.currentTarget.dataset.count
    switch (current) {
      case '1':
        this.setData({
          selectOne: true,
          selectTwo: false,
          selectThree: false,
          selectFour: false,
          passengers: current
        })
        break;
      case '2':
        this.setData({
          selectOne: false,
          selectTwo: true,
          selectThree: false,
          selectFour: false,
          passengers: current
        })
        break;
      case '3':
        this.setData({
          selectOne: false,
          selectTwo: false,
          selectThree: true,
          selectFour: false,
          passengers: current
        })
        break;
      case '4':
        this.setData({
          selectOne: false,
          selectTwo: false,
          selectThree: false,
          selectFour: true,
          passengers: current
        })
        break;
    }
  },
  // 点击打车
  callCar: function () {
    let isLoin = wx.getStorageSync('isLogin')
    if (!isLoin) {
      wx.showToast({
        title: '方便司机沟通请先登录',
        icon: "none"
      })
      wx.navigateTo({
        url: '../mine/mine',
      })
      return
    }
    if (this.data.passengers == 0) {
      wx.showToast({
        icon: 'none',
        title: '请先选择乘车人数',
      })
      return
    }
    this.setData({
      showLoading: !this.data.showLoading,
      disabled: "disabled"
    })
    if (this.data.showLoading) {
      this.sendToServer()
      this.setInteralPrompt()
      wx.showLoading({
        title: "呼叫司机中...",
        mask: true
      })
      if (orderId) {
        timeOut = setTimeout(() => {
          wx.hideLoading({
            success: (res) => {
              clearInterval(interal);
              wx.showToast({
                title: '司机没有响应',
                icon: "loading",
                duration: 1000
              })
              ctx.setData({
                showLoading: !ctx.data.showLoading,
                disabled: ""
              })
            },
          })
        }, 60000)
      }
    }
  },
  // 轮询司机接单状态
  setInteralPrompt() {
    interal = setInterval(() => {
      wx.request({
        url: app.globalData.baseUrl + 'pollingOrder?orderId=' + orderId,
        success(res) {
          var resdata = res.data
          if (resdata.code === 200) {
            ctx.setData({
              showLoading: !ctx.data.showLoading,
              btText: "司机正向您目前所在起始点赶来, 前耐心等候",
              driverName: resdata.driverName,
              driverLpn: resdata.driverLpn,
              driverTel: resdata.driverTel,
              disabled: "disabled",
              haveDriver: true,
            })
            wx.hideLoading();
            wx.showToast({
              title: '司机已经接单, 请耐心等候',
              duration: 2000
            })
            console.log(11)
            updateMarks = setInterval(ctx.getBaidulocations(), 10000)
            clearInterval(timeOut);
            clearInterval(interal);
          }
        }
      })
    }, 2000);
  },

  //发送订单信息到服务器
  sendToServer: function () {
    let tempData = this.data
    let timeStamp = Date.parse(new Date()).toString().slice(0, 10)
    let callName = wx.getStorageSync('callName')
    let phoneNumber = wx.getStorageSync('phoneNumber')
    orderId = md5Util.hex_md5(timeStamp + tempData.destTitle)
    let passengerData = {
      orderId: orderId,
      passengersCount: tempData.passengersCount,
      // passengerName: tempData.passengersName,
      // passengerTel: tempData.passengersTel,
      passengerName: callName,
      passengerTel: phoneNumber,
      passengerCount: tempData.passengers,
      geoMes: {
        startTitle: tempData.startTitle,
        startLat: tempData.startLat,
        startLon: tempData.startLon,
        destTitle: tempData.destTitle,
        destLat: tempData.destLat,
        destLon: tempData.destLon,
      },
      orderTime: formatTime.formatTime(new Date()),
      orderHandled: false
    }
    wx.request({
      url: app.globalData.baseUrl + 'callDriver',
      method: 'POST',
      data: passengerData,
      success: res => {
        console.log(res)
      }
    })
  },
  //获取司机的位置
  //获取服务器上的百度坐标
  getBaidulocations: function () {
    wx.request({
      url: app.globalData.baseUrl + 'getlocations?tel=' + ctx.data.driverTel,
      success: (res) => {
        ctx.reverseLocation(res.data.latitude, res.data.longitude, res.data.direction)
      },
      fail: (e) => {
        console.log(e)
      }
    })
    return ctx.getBaidulocations
  },
  //百度经纬度转换腾讯经纬度
  reverseLocation: function (baiduLatitude, baiduLongitude, direction) {
    // 调用接口
    qqMapWX.reverseGeocoder({
      location: {
        latitude: baiduLatitude,
        longitude: baiduLongitude
      },
      coord_type: 3, //baidu经纬度
      success: (res) => {
        var latitude = res.result.location.lat
        var longitude = res.result.location.lng;
        console.log(typeof (direction) + "\t" + typeof (longitude) + "\t" + latitude)
        ctx.setData({
          ['markers[2].latitude']: latitude,
          ['markers[2].longitude']: longitude,
          ['markers[2].rotate']: parseFloat(direction),
        })
        // ctx.DriverPassengerDistance(latitude,longitude)
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
  //计算司机和乘客之间的距离
  DriverPassengerDistance(driverLatitidu, driverLongitude) {
    qqMapWX.calculateDistance({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      //from参数不填默认当前地址
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      from: driverLatitidu + ',' + driverLongitude, //若起点有数据则采用起点坐标，若为空默认当前地址
      to: ctx.data.latitude + ',' + ctx.data.longitude, //终点坐标
      success: function (res) { //成功后的回调
        var res = res.result;
        var dis = [];
        for (var i = 0; i < res.elements.length; i++) {
          dis.push(res.elements[i].distance); //将返回数据存入dis数组，
        }
        ctx.setData({ //设置并更新distance数据
          distance: dis
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  tapCallPhone() {
    if (ctx.data.driverTel)
      wx.makePhoneCall({
        phoneNumber: ctx.data.driverTel //仅为示例，并非真实的电话号码
      })
  }
})