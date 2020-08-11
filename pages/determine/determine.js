var ctx
var app = getApp()
let interal
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
// 实例化API核心类
const qqMapWX = new QQMapWX({
  key: 'ZOKBZ-UTIH3-IDI36-3LEBF-GQZ5Z-D5BYI'
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false,
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
    ]
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
    if (this.data.passengers == 0) {
      wx.showToast({
        icon: 'none',
        title: '请先选择乘车人数',
      })
      return
    }
    this.setData({
      showLoading: !this.data.showLoading
    })
    if(this.data.showLoading){
      this.sendToServer()
      this.setInteralPrompt()
      wx.showModal({
        title: '等待司机接单',
        content: '等候 '+ ctx.data.second + ' 秒',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            clearInterval(interal);
            ctx.setData({
              showLoading: !ctx.data.showLoading
            })
          } else if (res.cancel) {
            clearInterval(interal);
            ctx.setData({
              showLoading: !ctx.data.showLoading
            })
          }
        }
      })
    }

  },
  setInteralPrompt(){
    let tempSecond = 1;
    interal = setInterval(() => {
      ctx.setData({
        second:tempSecond++
      })
      console.log(tempSecond)
    }, 1000);
  },
  //发送订单信息到服务器
  sendToServer: function(){
    let tempData = this.data
    let passengerData = {
      passengersCount: tempData.passengersCount,
      // passengerName: tempData.passengersName,
      // passengerTel: tempData.passengersTel,
      passengerName: "杨先生",
      passengerTel: "15121387795",
      passengerCount: tempData.passengers,
      geoMes: {
        startTitle: tempData.startTitle,
        startLat: tempData.startLat,
        startLon: tempData.startLon,
        destTitle: tempData.destTitle,
        destLat: tempData.destLat,
        destLon: tempData.destLon,
      }
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
  }
})