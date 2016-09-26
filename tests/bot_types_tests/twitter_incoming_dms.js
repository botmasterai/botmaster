'use strict';

const sender = {
  "id": 1196840096,
  "id_str": "1196840096",
  "name": "John-David Wuarin",
  "screen_name": "jdwuarin",
  "location": null,
  "url": null,
  "description": null,
  "protected": false,
  "followers_count": 103,
  "friends_count": 201,
  "listed_count": 1,
  "created_at": "Tue Feb 19 11:52:08 +0000 2013",
  "favourites_count": 3,
  "utc_offset": 3600,
  "time_zone": "London",
  "geo_enabled": false,
  "verified": false,
  "statuses_count": 49,
  "lang": "en",
  "contributors_enabled": false,
  "is_translator": false,
  "is_translation_enabled": false,
  "profile_background_color": "C0DEED",
  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
  "profile_background_tile": false,
  "profile_image_url": "http://pbs.twimg.com/profile_images/3277554509/bd3d2a58c9c2d402c28a357fd163c7ed_normal.jpeg",
  "profile_image_url_https": "https://pbs.twimg.com/profile_images/3277554509/bd3d2a58c9c2d402c28a357fd163c7ed_normal.jpeg",
  "profile_link_color": "0084B4",
  "profile_sidebar_border_color": "C0DEED",
  "profile_sidebar_fill_color": "DDEEF6",
  "profile_text_color": "333333",
  "profile_use_background_image": true,
  "default_profile": true,
  "default_profile_image": false,
  "following": false,
  "follow_request_sent": false,
  "notifications": false
};

const recipient = {
  "id": 720286086203715600,
  "id_str": "720286086203715584",
  "name": "Too_cool_for_you",
  "screen_name": "toocoolforyou_0",
  "location": null,
  "url": null,
  "description": null,
  "protected": false,
  "followers_count": 1,
  "friends_count": 2,
  "listed_count": 0,
  "created_at": "Wed Apr 13 16:22:40 +0000 2016",
  "favourites_count": 0,
  "utc_offset": -25200,
  "time_zone": "Pacific Time (US & Canada)",
  "geo_enabled": false,
  "verified": false,
  "statuses_count": 0,
  "lang": "en",
  "contributors_enabled": false,
  "is_translator": false,
  "is_translation_enabled": false,
  "profile_background_color": "F5F8FA",
  "profile_background_image_url": null,
  "profile_background_image_url_https": null,
  "profile_background_tile": false,
  "profile_image_url": "http://abs.twimg.com/sticky/default_profile_images/default_profile_0_normal.png",
  "profile_image_url_https": "https://abs.twimg.com/sticky/default_profile_images/default_profile_0_normal.png",
  "profile_link_color": "2B7BB9",
  "profile_sidebar_border_color": "C0DEED",
  "profile_sidebar_fill_color": "DDEEF6",
  "profile_text_color": "333333",
  "profile_use_background_image": true,
  "default_profile": true,
  "default_profile_image": true,
  "following": false,
  "follow_request_sent": false,
  "notifications": false
};

const textOnly = {
  "direct_message": {
    "id": 762648568935096300,
    "id_str": "762648568935096323",
    "text": "Party & Bullshit",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 13:56:02 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": []
    }
  }
};

const imageOnly = {
  "direct_message": {
    "id": 762655255939153900,
    "id_str": "762655255939153927",
    "text": " https://t.co/SD9voAYbzr",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 14:22:37 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": [
        {
          "url": "https://t.co/SD9voAYbzr",
          "expanded_url": "https://twitter.com/messages/media/762655255939153927",
          "display_url": "pic.twitter.com/SD9voAYbzr",
          "indices": [
            1,
            24
          ]
        }
      ],
      "media": [
        {
          "id": 762655255976898600,
          "id_str": "762655255976898560",
          "indices": [
            1,
            24
          ],
          "media_url": "https://ton.twitter.com/1.1/ton/data/dm/762655255939153927/762655255976898560/Oz22H7wf.jpg",
          "media_url_https": "https://ton.twitter.com/1.1/ton/data/dm/762655255939153927/762655255976898560/Oz22H7wf.jpg",
          "url": "https://t.co/SD9voAYbzr",
          "display_url": "pic.twitter.com/SD9voAYbzr",
          "expanded_url": "https://twitter.com/messages/media/762655255939153927",
          "type": "photo",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "medium": {
              "w": 600,
              "h": 395,
              "resize": "fit"
            },
            "large": {
              "w": 720,
              "h": 474,
              "resize": "fit"
            },
            "small": {
              "w": 340,
              "h": 223,
              "resize": "fit"
            }
          }
        }
      ]
    }
  }
};


const imageWithText = {
  "direct_message": {
    "id": 762640772189581300,
    "id_str": "762640772189581316",
    "text": "Party & Bullshit https://t.co/6eWmAS6xiw",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 13:25:03 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": [
        {
          "url": "https://t.co/6eWmAS6xiw",
          "expanded_url": "https://twitter.com/messages/media/762640772189581316",
          "display_url": "pic.twitter.com/6eWmAS6xiw",
          "indices": [
            3,
            26
          ]
        }
      ],
      "media": [
        {
          "id": 762640772218912800,
          "id_str": "762640772218912768",
          "indices": [
            3,
            26
          ],
          "media_url": "https://ton.twitter.com/1.1/ton/data/dm/762640772189581316/762640772218912768/dfxOYMTR.jpg",
          "media_url_https": "https://ton.twitter.com/1.1/ton/data/dm/762640772189581316/762640772218912768/dfxOYMTR.jpg",
          "url": "https://t.co/6eWmAS6xiw",
          "display_url": "pic.twitter.com/6eWmAS6xiw",
          "expanded_url": "https://twitter.com/messages/media/762640772189581316",
          "type": "photo",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "medium": {
              "w": 600,
              "h": 395,
              "resize": "fit"
            },
            "large": {
              "w": 720,
              "h": 474,
              "resize": "fit"
            },
            "small": {
              "w": 340,
              "h": 223,
              "resize": "fit"
            }
          }
        }
      ]
    }
  }
};

const videoOnly = {
  "direct_message": {
    "id": 762671565947494400,
    "id_str": "762671565947494405",
    "text": " https://t.co/AT3N5c6PEX",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 15:27:25 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": [
        {
          "url": "https://t.co/AT3N5c6PEX",
          "expanded_url": "https://twitter.com/messages/media/762671565947494405",
          "display_url": "pic.twitter.com/AT3N5c6PEX",
          "indices": [
            1,
            24
          ]
        }
      ],
      "media": [
        {
          "id": 762671519986319400,
          "id_str": "762671519986319360",
          "indices": [
            1,
            24
          ],
          "media_url": "https://pbs.twimg.com/dm_video_preview/762671519986319360/img/nwh2ABNgZSxOmqI9RhuxjKuZ3eN7wLg8lzABjeF41bk.jpg",
          "media_url_https": "https://pbs.twimg.com/dm_video_preview/762671519986319360/img/nwh2ABNgZSxOmqI9RhuxjKuZ3eN7wLg8lzABjeF41bk.jpg",
          "url": "https://t.co/AT3N5c6PEX",
          "display_url": "pic.twitter.com/AT3N5c6PEX",
          "expanded_url": "https://twitter.com/messages/media/762671565947494405",
          "type": "video",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "medium": {
              "w": 600,
              "h": 1067,
              "resize": "fit"
            },
            "large": {
              "w": 720,
              "h": 1280,
              "resize": "fit"
            },
            "small": {
              "w": 340,
              "h": 604,
              "resize": "fit"
            }
          },
          "video_info": {
            "aspect_ratio": [
              9,
              16
            ],
            "duration_millis": 1291,
            "variants": [
              {
                "bitrate": 320000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/180x320/Jf8WOAmvNe69JAJ1Kxb18tBTagTN5BbvZjIFBJHQRKE.mp4"
              },
              {
                "bitrate": 2176000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/720x1280/cVTnZqWOdFPmGS_h9AjvW3m4NqWPkQCDsXc9VOx3kIQ.mp4"
              },
              {
                "content_type": "application/dash+xml",
                "url": "https://video.twimg.com/dm_video/762671519986319360/pl/AvSQ9pxR_qV1nyCGkhMH07NllAdFjSaiWEsqSCHiJD8.mpd"
              },
              {
                "content_type": "application/x-mpegURL",
                "url": "https://video.twimg.com/dm_video/762671519986319360/pl/AvSQ9pxR_qV1nyCGkhMH07NllAdFjSaiWEsqSCHiJD8.m3u8"
              },
              {
                "bitrate": 832000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/360x640/XzTytEpKddk7ok2eJc11KOze9a800g6TaSz6fDXsUwg.mp4"
              }
            ]
          }
        }
      ]
    }
  }
};

const videoWithImageWithText = {
  "direct_message": {
    "id": 762671565947494400,
    "id_str": "762671565947494405",
    "text": "Party & Bullshit https://t.co/AT3N5c6PEX https://t.co/SD9voAYbzr",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 15:27:25 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": [
        {
          "url": "https://t.co/AT3N5c6PEX",
          "expanded_url": "https://twitter.com/messages/media/762671565947494405",
          "display_url": "pic.twitter.com/AT3N5c6PEX",
          "indices": [
            1,
            24
          ]
        }
      ],
      "media": [
        {
          "id": 762671519986319400,
          "id_str": "762671519986319360",
          "indices": [
            1,
            24
          ],
          "media_url": "https://pbs.twimg.com/dm_video_preview/762671519986319360/img/nwh2ABNgZSxOmqI9RhuxjKuZ3eN7wLg8lzABjeF41bk.jpg",
          "media_url_https": "https://pbs.twimg.com/dm_video_preview/762671519986319360/img/nwh2ABNgZSxOmqI9RhuxjKuZ3eN7wLg8lzABjeF41bk.jpg",
          "url": "https://t.co/AT3N5c6PEX",
          "display_url": "pic.twitter.com/AT3N5c6PEX",
          "expanded_url": "https://twitter.com/messages/media/762671565947494405",
          "type": "video",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "medium": {
              "w": 600,
              "h": 1067,
              "resize": "fit"
            },
            "large": {
              "w": 720,
              "h": 1280,
              "resize": "fit"
            },
            "small": {
              "w": 340,
              "h": 604,
              "resize": "fit"
            }
          },
          "video_info": {
            "aspect_ratio": [
              9,
              16
            ],
            "duration_millis": 1291,
            "variants": [
              {
                "bitrate": 320000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/180x320/Jf8WOAmvNe69JAJ1Kxb18tBTagTN5BbvZjIFBJHQRKE.mp4"
              },
              {
                "bitrate": 2176000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/720x1280/cVTnZqWOdFPmGS_h9AjvW3m4NqWPkQCDsXc9VOx3kIQ.mp4"
              },
              {
                "content_type": "application/dash+xml",
                "url": "https://video.twimg.com/dm_video/762671519986319360/pl/AvSQ9pxR_qV1nyCGkhMH07NllAdFjSaiWEsqSCHiJD8.mpd"
              },
              {
                "content_type": "application/x-mpegURL",
                "url": "https://video.twimg.com/dm_video/762671519986319360/pl/AvSQ9pxR_qV1nyCGkhMH07NllAdFjSaiWEsqSCHiJD8.m3u8"
              },
              {
                "bitrate": 832000,
                "content_type": "video/mp4",
                "url": "https://video.twimg.com/dm_video/762671519986319360/vid/360x640/XzTytEpKddk7ok2eJc11KOze9a800g6TaSz6fDXsUwg.mp4"
              }
            ]
          }
        },
        {
          "id": 762655255976898600,
          "id_str": "762655255976898560",
          "indices": [
            1,
            24
          ],
          "media_url": "https://ton.twitter.com/1.1/ton/data/dm/762655255939153927/762655255976898560/Oz22H7wf.jpg",
          "media_url_https": "https://ton.twitter.com/1.1/ton/data/dm/762655255939153927/762655255976898560/Oz22H7wf.jpg",
          "url": "https://t.co/SD9voAYbzr",
          "display_url": "pic.twitter.com/SD9voAYbzr",
          "expanded_url": "https://twitter.com/messages/media/762655255939153927",
          "type": "photo",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "medium": {
              "w": 600,
              "h": 395,
              "resize": "fit"
            },
            "large": {
              "w": 720,
              "h": 474,
              "resize": "fit"
            },
            "small": {
              "w": 340,
              "h": 223,
              "resize": "fit"
            }
          }
        }
      ]
    }
  }
};

const gifOnly = {
  "direct_message": {
    "id": 762712201660665900,
    "id_str": "762712201660665860",
    "text": " https://t.co/Budb9hohRr",
    "sender": sender,
    "sender_id": 1196840096,
    "sender_id_str": "1196840096",
    "sender_screen_name": "jdwuarin",
    "recipient": recipient,
    "recipient_id": 720286086203715600,
    "recipient_id_str": "720286086203715584",
    "recipient_screen_name": "toocoolforyou_0",
    "created_at": "Mon Aug 08 18:08:54 +0000 2016",
    "entities": {
      "hashtags": [],
      "symbols": [],
      "user_mentions": [],
      "urls": [
        {
          "url": "https://t.co/Budb9hohRr",
          "expanded_url": "https://twitter.com/messages/media/762712201660665860",
          "display_url": "pic.twitter.com/Budb9hohRr",
          "indices": [
            1,
            24
          ]
        }
      ],
      "media": [
        {
          "id": 762712152901836800,
          "id_str": "762712152901836804",
          "indices": [
            1,
            24
          ],
          "media_url": "https://pbs.twimg.com/dm_gif_preview/762712152901836804/D48bbEKGhPr2F3kDOH2mhzlD3fBZuxcngHkBwcSfLvgLLUbCOS.jpg",
          "media_url_https": "https://pbs.twimg.com/dm_gif_preview/762712152901836804/D48bbEKGhPr2F3kDOH2mhzlD3fBZuxcngHkBwcSfLvgLLUbCOS.jpg",
          "url": "https://t.co/Budb9hohRr",
          "display_url": "pic.twitter.com/Budb9hohRr",
          "expanded_url": "https://twitter.com/messages/media/762712201660665860",
          "type": "animated_gif",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "small": {
              "w": 245,
              "h": 248,
              "resize": "fit"
            },
            "large": {
              "w": 245,
              "h": 248,
              "resize": "fit"
            },
            "medium": {
              "w": 245,
              "h": 248,
              "resize": "fit"
            }
          },
          "video_info": {
            "aspect_ratio": [
              61,
              62
            ],
            "variants": [
              {
                "bitrate": 0,
                "content_type": "video/mp4",
                "url": "https://pbs.twimg.com/dm_gif/762712152901836804/D48bbEKGhPr2F3kDOH2mhzlD3fBZuxcngHkBwcSfLvgLLUbCOS.mp4"
              }
            ]
          }
        }
      ]
    }
  }
};

module.exports = {
  textOnly,
  imageOnly,
  imageWithText,
  videoOnly,
  videoWithImageWithText,
  gifOnly
};
