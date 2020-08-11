//app.js
App({
  onLaunch: function () {
    wx.getSystemInfo({
      complete: (res) => {
        this.globalData.statusBarHeight = res.statusBarHeight
      },
    })
    this.checkUserAuthority()
  },
  globalData: {
    //https://upyoung.xyz/ http://192.168.3.218/ http://47.100.139.125:8000/
    baseUrl: 'https://upyoung.xyz/',
    statusBarHeight: 0,
  },
  //检查用户是否打开gps
  checkUserAuthority() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']!=null && res.authSetting['scope.userLocation']==false ) {
          wx.showModal({
            title: '权限不足',
            content: '请先授予位置信息权限',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  complete: (res) => {
                    if (!res.authSetting["scope.userLocation"]){
                      wx.showToast({
                        icon: 'none',
                        title: '权限不足',
                        duration: 3000
                      })
                    }
                  },
                })
              } else if (res.cancel) {
                wx.showToast({
                  icon: 'none',
                  title: '权限不足',
                  duration: 3000
                })
              }
            }
          })
        }
      },
    })
  }
})