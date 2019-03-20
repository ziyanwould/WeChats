'use strict'

module.exports = {
    "button":[
        {    
             "type":"click",
             "name":"点击事件",
             "key":"V1001_TODAY_MUSIC"
         },
         {
              "name":"点出菜单",
              "sub_button":[
              {    
                  "type":"view",
                  "name":"跳转URL",
                  "url":"http://gitHub.com/"
               },
               {
                "type":"scancode_waitmsg",
                "name":"扫码推送中",
                 "key":"qr_scan_wait"
              },
              {
                "type":"pic_sysphoto",
                "name":"弹出系统拍照",
                 "key":"pic_photo"
              },
              {
                "type":"pic_photo_or_album",
                "name":"弹出系统拍照或相册",
                 "key":"pic_photo_album"
              }]
          },
          {
            "name":"点出菜单2",
            "sub_button":[
           
             {
              "type":"pic_weixin",
              "name":"相册发图",
               "key":"pic_weixin"
            },
            {
              "type":"location_select",
              "name":"地理位置选着",
               "key":"location_select"
            },
            {
              "type":"media_id",
              "name":"下发图片消息",
              "media_id": "MEDIA_ID1"
            },{
                "type":"view_limited",
                "name":"图文跳转的UR了",
                "media_id": "MEDIA_ID1"
              }]
        }
        ]
}