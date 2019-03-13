
'use strict'

const util = require('./libs/util')
const path  = require('path')

const wechat_file = path.resolve(__dirname,'./config/wechat.text')
const config ={
    wechat:{
        appID:'wxfa6bdf3e14057d81',
        appSecret:'c6832594b1f67c03d369529fc906f774',
        token:'ziyanwould',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function(data){
           
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

module.exports=config