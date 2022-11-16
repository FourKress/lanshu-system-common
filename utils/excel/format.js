import { formatMoney, isNull } from '@common/utils/index';

// 后端没处理金额和百分比，前端处理一下
export const handleSpecialData = (data) => {
  return data.map(item => {
    const moneyKey = getMoneyKey(item)
    const ratioKey = getRadioKey(item)

    if (moneyKey.length > 0) {
      moneyKey.forEach(function (key) {
        item[key] = formatMoney(item[key])
      })
    }
    if (ratioKey.length > 0) {
      ratioKey.forEach(function (key) {
        // 如果本身已经有%了,就不用再次加上%
        if (!isNull(item[key]) && !item[key].includes('%')) {
          item[key] = item[key] + '%'
        }
      })
    }
    return item
  })
}

const getMoneyKey = (recordsItem) => {
  let moneyKey = []
  Object.keys(recordsItem).forEach(key => {
    // Amt结尾的就是金额
    if (/Amt$/.test(key)) {
      moneyKey.push(key)
    }
  })
  return moneyKey
}

const getRadioKey = (recordsItem) => {
  let ratioKey = []
  Object.keys(recordsItem).forEach(key => {
    // Ratio结尾就是百分比
    if (/Ratio$/.test(key)) {
      ratioKey.push(key)
    }
  })
  return ratioKey
}
