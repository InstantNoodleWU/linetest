require('dotenv').config()
const linebot = require('linebot')
const rp = require('request-promise')

const callAPI = async (name) => {
  let data = ''
  try {
    const str = await rp('http://2016.cec.gov.tw/opendata/api/proofreadercanrpt/json')
    let json = JSON.parse(str)
    json = json.filter(j => {
      return j.RecPartyName === name
    })
    if (json.length === 0) data = '找不到資料'
    else data = json[0].CandidateUrl
  } catch (error) {
    data = '發生錯誤'
  }
  return data
}

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})

bot.on('message', event => {
  if (event.message.type === 'text') {
    const usermsg = event.message.text
    callAPI(usermsg).then(result => {
      if (result.substr(0, 5) === 'https') {
        event.reply({
          type: 'image',
          originalContentUrl: result,
          previewImageUrl: result
        })
      } else event.reply(result)
    }).catch(() => {
      event.reply('發生錯誤')
    })
  }
})
