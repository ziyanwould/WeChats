const Koa = require('koa');
const util = require('./libs/util')
const path  = require('path')
const wechat = require('./wechat/g')
const config = require('./config')
const reply = require('./wx/reply.js')
const wechat_file = path.resolve(__dirname,'./config/wechat.text')


const app = new Koa()
app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234')