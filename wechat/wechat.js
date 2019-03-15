//全局票据
const  prefix = 'https://api.weixin.qq.com/cgi-bin/'
const Promise = require('bluebird') 
const _ = require('lodash')
const util = require('./util')
const  fs = require('fs')
const request = Promise.promisify(require('request'))
const api = {
    accessToken:prefix +'token?grant_type=client_credential',
  
    temporary:{ //临时素材
      upload: prefix +'media/upload?'
    },
    permanent:{
        upload: prefix +'material/add_material?',
        uploadNews:  prefix +'material/add_news?',
        uploadNewsPic:  prefix +'media/uploadimg?'
    }
}

function Wechat(opts){
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()


}
Wechat.prototype.fetchAccessToken=function(data){
    let  that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }

    this.getAccessToken()
    .then(data=>{
        try{
            data = JSON.parse(data)
         
        }
        catch(e){
            return that.updataAccessToken()
        }

        if(that.isValidAccessToken(data)){ //是否有限期内
             
           return  Promise.resolve(data)
        }else{
            return that.updataAccessToken() 
        }
    })
    .then(data=>{//最终得到的票据    始终获取不到本地数据
    //   if(data){
      
        that.access_token = data.access_token 
        that.expires_in = data.expires_in  //有效期
  
        that.saveAccessToken(data)


       //返回个数值回去
        return Promise.resolve(data)
    //   }
     
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

//更新临时素材
Wechat.prototype.uploadMaterial = function (type,material,permanent) { //传入 文件及文件路径  //permanent 是为了更多的参数
    let that = this
    let form = {}
    let uploadUrl = api.temporary.upload

    if(permanent){
        uploadUrl = api.permanent.upload
        _.extend(form,permanent)
    }
    if(type === 'pic'){
        uploadUrl = api.permanent.uploadNewsPic
    }
    if(type === 'news'){
        uploadUrl = api.permanent.uploadNews
        form = material
    }else{
        form.media=fs.createReadStream(material)
    }
    

 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = uploadUrl +'access_token='+data.access_token
        
        if(!permanent){
            url += '&type='+type
        }else{
           form.access_token = data.access_token 
        }

        let options ={
            method:'POST',
            url:url,
            json:true
        }

        if(type === 'news'){
            options.body = form
        }else{
            options.formData = form
        }
        request({method:'POST',url:url,formData:form,json:true}).then(response=>{
           // console.log(response)
            let _data = response.body
            if(_data){
                resolve(_data)
            }
            else{
             throw new Error('Upload material fails')//文档已经改变 返回是一个对象不是数组 论监听对象的重要性
            }
           
        })
        .catch(function(err){
            reject(err)
        })
    })

 })
   

}

Wechat.prototype.reply = function(){
   let content = this.body
   let message = this.weixin
//    console.log(message)
   let xml = util.tpl(content,message) 
  

   this.status = 200
   this.type = 'application/xml'
   this.body = xml
}
module.exports =Wechat
