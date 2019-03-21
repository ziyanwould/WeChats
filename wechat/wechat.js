//全局票据
const  prefix = 'https://api.weixin.qq.com/cgi-bin/'
const  semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'
const Promise = require('bluebird') 
const _ = require('lodash')
const util = require('./util')
const  fs = require('fs')
const request = Promise.promisify(require('request'))
const api = {
    accessToken:prefix +'token?grant_type=client_credential',
    semanticUrl:semanticUrl,
    temporary:{ //临时素材
      upload: prefix +'media/upload?',
      fetch:  prefix +'media/get?'
    },
    permanent:{
        upload: prefix +'material/add_material?',
        fetch:  prefix +'material/get_material?',
        uploadNews:  prefix +'material/add_news?',
        uploadNewsPic:  prefix +'media/uploadimg?',
        del:  prefix +'material/del_material?',
        update:prefix +'material/update_news?',
        count: prefix +'material/get_materialcount?',//数量
        batch: prefix +'material/batchget_material?' //列表
    },
    group:{//用户管理(标签)
        create:prefix +'tags/create?',//创建标签
        fetch:   prefix + 'tags/get?',//获取已经创建标签
        check: prefix + 'tags/getidlist?',//获取用户标签
        user: prefix + 'user/tag/get?',//获取标签下粉丝列表
        update:prefix + 'tags/update?',//编辑标签
        del: prefix +'tags/delete?',//删除标签
        batchtagging:prefix +'tags/members/batchtagging?',//批量标签
        batchuntagging:prefix +'tags/members/batchuntagging?'//批量取消标签
    },
    user:{
        remark: prefix +'user/info/updateremark?',//用户备注名
        fetch:  prefix +'user/info?',//单条
        batchFetch:prefix +'user/info/batchget?',//多条
        list:   prefix +'user/get?'
    },
    mass:{
        group: prefix + 'message/mass/sendall?',//分组群发
        openId: prefix +'message/mass/send?',//通过openId
        del :   prefix +'message/mass/delete?',//删除
        preview: prefix +'message/mass/preview?',//预览
        check:   prefix +'message/mass/get?'//检查发送的状态
    },
    menu:{
        create : prefix + 'menu/create?',
        get    : prefix + 'menu/get?',
        del    : prefix + 'menu/delete?',
        current: prefix + 'get_current_selfmenu_info?'//获取自定义菜单配置接口

    },
    ticket:{
     
        get :prefix + 'ticket/getticket?'
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

   return this.getAccessToken()
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
//获取jsapi_ticket
Wechat.prototype.fetchTicket=function(access_token){
    let  that = this


   return this.getTicket()
    .then(data=>{
        try{
            data = JSON.parse(data)
         
        }
        catch(e){
            return that.updataTicket(access_token)
        }

        if(that.isValidTicket(data)){ //是否有限期内
             
           return  Promise.resolve(data)
        }else{
            return that.updataTicket(access_token) 
        }
    })
    .then(data=>{//最终得到的票据    始终获取不到本地数据
    //   if(data){
      
     
  
        that.saveTicket(data)


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

//sdk 获得jsapi_ticket（有效期7200秒，开发者必须在自己的服务全局缓存jsapi_ticket）
Wechat.prototype.updataTicket = function () { //请求票据

    let url = api.ticket.get + 'access_token=' + access_token +'&type=jsapi'

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

//jsapi_ticket 检查是否过期
Wechat.prototype.isValidTicket = data=> {
    if(!data || !data.Ticket || !data.expires_in){
        return false
    }
  
    let Ticket = data.Ticket //票据
    let expires_in = data.expires_in    //过期时间
    let now = (new Date().getTime())  //现在时间

    if(Ticket && now < expires_in){
        return true
    }else{
        return false
    }

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
        request(options).then(response=>{
        //    console.log(response)
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

//获取素材 
Wechat.prototype.fetchMaterial = function (mediaId,type,permanent) { //传入 mediaId  //permanent 是为了更多的参数
    let that = this
    let fetchUrl = api.temporary.fetch

    if(permanent){
        fetchUrl = api.permanent.fetch
       
    }
   
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = fetchUrl +'access_token='+data.access_token + '&media_id=' + mediaId
        let form = {}
        let options = {method:'POST',url:url,json:true}
        if(permanent){
            form.media_id=mediaId,
            form.access_token=data.access_token
            options.body = form
        }else{
            if(type === 'video'){
                url = url.replace('https://','http://')
            }
            url += '&media_id' + mediaId
        }
       
        if(type === 'news' || type ==='video'){
            request(options).then(response=>{
                // console.log(response)
                 let _data = response.body
                 if(_data){
                     resolve(_data)
                 }
                 else{
                  throw new Error('Delete material fails')
                 }
                
             })
             .catch(function(err){
                 reject(err)
             })
        }else{
            resolve(url)
        }

  
        // if(!permanent || type === 'video'){
        //     url = url.replace('https://','http://')
          
        // }

        //resolve(url)
    })

 })
   

}

//删除素材 
Wechat.prototype.deleteMaterial = function (mediaId) { //传入 mediaId  //permanent 是为了更多的参数
    let that = this
    let form = {
        media_id:mediaId
    }
   
   
    

 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.permanent.del +'access_token='+data.access_token + '&media_id=' + mediaId
        
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('Delete material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//修改素材 
Wechat.prototype.updateMaterial = function (mediaId,news) { 
    let that = this
    let form = {
        media_id:mediaId
    }
   
   _.extend(from,news)
    

 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.permanent.update +'access_token='+data.access_token + '&media_id=' + mediaId
        
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('updata material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//数量
Wechat.prototype.countMaterial = function () { 
    let that = this
  
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.permanent.count +'access_token='+data.access_token 
        
        request({method:'GET',url:url,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('count material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//列表
Wechat.prototype.batchMaterial = function (options) { 
    let that = this
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.permanent.batch +'access_token='+data.access_token 
        
        request({method:'POST',url:url,body:options,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('count material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}
//创建标签
Wechat.prototype.createTag = function (name) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.create +'access_token='+data.access_token 
        let form = {
            tag:{
                name:name
            }
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('createGroupMaterial material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}
//获取标签
Wechat.prototype.fetchTag = function () { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.fetch +'access_token='+data.access_token 
       
        request({url:url,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('fetchMaterial material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//查看用户哪个标签
Wechat.prototype.checkTag = function (openId) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.check +'access_token='+data.access_token 
        let form = {
            openid:openId
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('checkMaterial material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}


//批量打标签
Wechat.prototype.batchtaggingTag = function (openIds,to) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.batchtagging +'access_token='+data.access_token 
        let form = {
            openid_list:openIds,
            tagid:to
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('batchtaggingMaterial material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//批量取消标签
Wechat.prototype.batchuntaggingTag = function (openIds,to) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.batchuntagging +'access_token='+data.access_token 
        let form = {
            openid_list:openIds,
            tagid:to
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('batchuntagging material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}


//删除标签
Wechat.prototype.deleteTag = function (id) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.del +'access_token='+data.access_token 
        let form = {
            tag:{        
                id : id 
             }
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('deleteTag material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//编辑标签
Wechat.prototype.updateTag = function (id,name) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.update +'access_token='+data.access_token 
        let form = {
            tag:{        
                id : id ,
                name:name
             }
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('updateTag material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//获取标签人数
Wechat.prototype.userTag = function (id,next_openid) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.group.user +'access_token='+data.access_token 
        let form = {
            tagid:id,
            next_openid:next_openid
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('userTag material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//给用户名备注
Wechat.prototype.remarkUser = function (openId,remark) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.user.remark +'access_token='+data.access_token 
        let form = {
            openid:openId,
            remark:remark
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('userTag material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//获取用户基本本信息
Wechat.prototype.fetchUsers = function (openIds,lang) { 
    let that = this
     lang = lang || 'zh_CN'
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
     
      
        let options = {
            json:true
        }
        if(_.isArray(openIds)){//._函数可以进行很多判断工作
            options.url = api.user.batchFetch +'access_token='+data.access_token 
            options.body ={
                user_list:openIds
            }
            options.method='POST'
        }else{
            options.url = api.user.fetch +'access_token='+data.access_token+'&openid='+openIds+'&lang='+lang
        }
       
       
        request(options).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('fetchUsers material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//获取粉丝
Wechat.prototype.listUsers = function (openId) { 
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.user.list +'access_token='+data.access_token 
        if(openId){
            url +='&next_openid='+openId
        }
        request({method:'GET',url:url,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('listUsers material fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//分组群发 
Wechat.prototype.sendByGroup = function (type,message,groupId) { //类型 消息 标签ID
    let that = this
    let msg = {
        filter:{},
        msgtype:type
    }
    msg[type] = message

    if(!groupId){
        msg.filter.is_to_all = true
    }else{
        msg.filter = {
            is_to_all:false,
            tag_id:groupId
        }
    }
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.mass.group +'access_token='+data.access_token 
    
        request({method:'POST',url:url,body:msg,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('sendByGroup fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}


//单发 
Wechat.prototype.sendByOpenID = function (type,message,openIds) { //类型 消息 标签ID
    let that = this
    let msg = {
      msgtype:type,
      touser:openIds
    }
    msg[type] = message

   
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.mass.openId +'access_token='+data.access_token 
    
        request({method:'POST',url:url,body:msg,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('sendByOpenID fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}


//群删
Wechat.prototype.deleteMass = function (msgId,article_idx=0) { //类型 消息 标签ID
    let that = this
 return new Promise (function(resolve,reject){
    // 拿到全局票据
    that
    .fetchAccessToken()
    .then(data=>{
        let url = api.mass.del +'access_token='+data.access_token 
        let form = {
            msg_id:msgId,
            article_idx:article_idx
        }
        request({method:'POST',url:url,body:form,json:true}).then(response=>{
            // console.log(response)
             let _data = response.body
             if(_data){
                 resolve(_data)
             }
             else{
              throw new Error('deleteMass fails')
             }
            
         })
         .catch(function(err){
             reject(err)
         })
    })

 })
   

}

//群发预览 
Wechat.prototype.previewMass = function (type, message ,openId) { //类型 消息 标签ID
    let that = this
    let msg = {
       msgtype:type,
       touser:openId,
    }
    msg[type] = message


    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.mass.preview +'access_token='+data.access_token 
        
           request({method:'POST',url:url,body:msg,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('previewMass fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }

//检查送达状态
Wechat.prototype.checkMass = function (msgId) { //类型 消息 标签ID
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.mass.check +'access_token='+data.access_token 
           let form = {
            msg_id:msgId
        }
           request({method:'POST',url:url,body:form,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('checkMass fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }


//创建菜单
Wechat.prototype.createMenu = function (menu) { 
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.menu.create +'access_token='+data.access_token 
       
           request({method:'POST',url:url,body:menu,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('createMenu fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }


//获取菜单
Wechat.prototype.getMenu = function () { 
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.menu.get +'access_token='+data.access_token 
       
           request({url:url,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('getMenu fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }

//删除菜单
Wechat.prototype.deleteMenu = function () { 
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.menu.del +'access_token='+data.access_token 
       
           request({url:url,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('deleteMenu fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }

//查询自定义接口
Wechat.prototype.getCurrentMenu = function () { 
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.menu.current +'access_token='+data.access_token 
       
           request({url:url,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('getCurrentMenu fails')
                }
               
            })
            .catch(function(err){
                reject(err)
            })
       })
   
    })
      
   
   }

//语义理解
Wechat.prototype.semantic = function (semanticData) { 
    let that = this
   
    return new Promise (function(resolve,reject){
       // 拿到全局票据
       that
       .fetchAccessToken()
       .then(data=>{
           let url = api.semanticUrl +'access_token='+data.access_token 
           semanticData.appid = data.appID
           request({method:'POST',url:url,body:semanticData,json:true}).then(response=>{
               // console.log(response)
                let _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                 throw new Error('semantic fails')
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
