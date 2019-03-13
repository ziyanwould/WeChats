
'use strict'

let  xml2js = require('xml2js')
let tpl =require('./tpl')
// const Promise = require('bluebird') 
exports.parseXMLAsync =xml =>{

    return new Promise((resolve,reject)=>{
        xml2js.parseString(xml,{trim:true},(err,content)=>{
            if(err) reject(err)
            else resolve(content)
        }) 
    })
}

//遍历的过程
function formatMessage(result){
  let message = {}
 // console.log("result",result)
  if(typeof result === 'object'){
      let keys = Object.keys(result)
      for (let i =0;i<keys.length;i++){
        let item = result[keys[i]]  
        let key = keys[i]

        if(!(item instanceof Array) || item.length === 0){
            continue //不为数组 长度为零 跳下去
        }
        if(item.length ===1){
            let val = item[0]

            if(typeof val === 'object'){
                message[key] = formatMessage(val)//调用自身 继续
            }
            else{
                message[key] = (val || '').trim() //拿掉首位空格
            }
        }
        else{
            message[key] = []

            for (let j =0,k=item.length;j<k;j++){
                message[key].push(formatMessage(item[j]))
            }
        }
      }
  }
  return message
}
exports.formatMessage = formatMessage
// exports.formatMessage =xml =>{
   
//     //var cleanedString = origString.replace("\ufeff", "");
//     return new Promise((resolve,reject)=>{
//         xml2js.parseString(xml,{trim:true},(err,content)=>{
//             if(err) reject(err)
//             else resolve(content)
//         }) 
//     })
// }  照搬的心累 哎 明明都进行一次xml2js 又来一次 能不报错么


exports.tpl = function(content,message){
    let info ={}
    let type ='text'
    let fromUserName = message.FromUserName
    let toUserName = message.ToUserName

    if(Array.isArray(content)){
        type = 'news'
    }
    //console.log(content)
    type = content.type || type
    info.content =content
    info.createTime = new Date().getTime()
    info.msgType = type
    info.toUserName = fromUserName
    info.fromUserName = toUserName


    return tpl.compiled(info)
}