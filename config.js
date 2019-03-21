
'use strict'

const util = require('./libs/util')
const path  = require('path')

const wechat_file = path.resolve(__dirname,'./config/wechat.text')
const wechat_ticket_file = path.resolve(__dirname,'./config/wechat_ticket.text')
const config ={
    wechat:{
        // appID:'wxfa6bdf3e14057d81',
        // appSecret:'c6832594b1f67c03d369529fc906f774',
        appID:'wxf2d1d23f5191f54a',
        appSecret:'24ac7f7db2530872a2aa6e8f47dda68c',
        token:'ziyanwould',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function(data){
           
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        },
        getTicket:function(){
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket:function(data){
           
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_ticket_file,data)
        }
    }
}

module.exports=config