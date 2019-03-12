//全局票据
const  prefix = 'https://api.weixin.qq.com/cgi-bin/'
const Promise = require('bluebird') 
const request = Promise.promisify(require('request'))
const api = {
    accessToken:prefix +'token?grant_type=client_credential'
}

function Wechat(opts){
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken


    this.getAccessToken()
    .then(data=>{
        try{
            data = JSON.parse(data)
         
        }
        catch(e){
            return that.updataAccessToken()
        }

        if(that.isValidAccessToken(data)){ //是否有限期内
             
               Promise.resolve(data)
        }else{
            return that.updataAccessToken() 
        }
    })
    .then(data=>{//最终得到的票据    始终获取不到本地数据
      if(data){
      
        that.access_token = data.access_token 
        that.expires_in = data.expires_in  //有效期
  
        that.saveAccessToken(data)
      }
     
    })
}

Wechat.prototype.isValidAccessToken = data=> {
    if(!data || !data.access_token || !data.expires_in){
        return false
    }
  
    let access_token = data.access_token //票据
    let expires_in =data.expires_in    //过期时间
    let now = (new Date().getTime())  //现在时间

    if(now < expires_in){
        return true
    }else{
        return false
    }

}

Wechat.prototype.updataAccessToken = function () { //请求票据
    let appID = this.appID
    let appSecret = this.appSecret
    let url = api.accessToken +'&appid='+appID+'&secret='+appSecret

    //console.log(appID,appSecret,url)

 return new Promise (function(resolve,reject){
    request({url:url,json:true}).then(function(response){
        let data = response.body
       // console.log('data',data)
        let now = (new Date().getTime())
        let expires_in = now + (data.expires_in - 20 ) * 1000 //提前20秒 防止网络延时等因素
  
        data.expires_in = expires_in
        resolve(data)
      })
 })
   

}

module.exports =Wechat
