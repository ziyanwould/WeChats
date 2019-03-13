'use strict'

const ejs = require('ejs')
const heredoc = require('heredoc')

let tpl = heredoc(function(){
/*
<xml>

<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
<FromUserName><![CDATA[<%= UserName %>]]></FromUserName>
<CreateTime><%= createTime %></CreateTime>
<MsgType><![CDATA[<%= msgType %>]]></MsgType>

<% if (msgType ==='text') {%>

<Content><![CDATA[<%= content  %>]]></Content>

<% } else if (msgType ==='image') {  %>

    <Image>
    <MediaId><![CDATA[<%= conten.media_id %>]]></MediaId>
  </Image>

  <% } else if (msgType ==='voice') {  %>

    <Voice>
    <MediaId><![CDATA[<%= conten.media_id %>]]></MediaId>
    </Voice>

    <% } else if (msgType ==='video') {  %>

    <Video>
    <MediaId><![CDATA[<%= conten.media_id %>]]></MediaId>
    <Title><![CDATA[<%= conten.title %>]]></Title>
    <Description><![CDATA[<%= conten.description %>]]></Description>
  </Video>

    <% } else if (msgType ==='music') {  %>
        <Music>
    <Title><![CDATA<%= conten.title %>]]></Title>
    <Description><![CDATA[<%= conten.media_id %>]]></Description>
    <MusicUrl><![CDATA[<%= conten.musicUrl %>]]></MusicUrl>
    <HQMusicUrl><![CDATA[<%= conten.hqMusicUrl %>]]></HQMusicUrl>
    <ThumbMediaId><![CDATA[<%= conten.thumbMediaId %>]]></ThumbMediaId>
  </Music>

  <% } else if (msgType ==='news') {  %>

    <ArticleCount><%= conten.length %></ArticleCount>
   <Articles>
   <% conten.forEach(function(item){%>
    <item>
      <Title><![CDATA[<%= item.title %>]]></Title>
      <Description><![CDATA[<%= item.description %>]]></Description>
      <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
      <Url><![CDATA[<%= item.url %>]]></Url>
    </item>
    <%})%>
  </Articles>
<% } %>
</xml>


*/})

let compiled = ejs.compile(tpl)

exports = module.exports={//暴露一个对象
 compiled:compiled
}