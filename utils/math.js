const countDecimals = function (num) {
  let len = 0;
  try {
    num = Number(num);
    let str = num.toString().toUpperCase();
    if (str.split('E').length === 2) {
      // scientific notation
      let isDecimal = false;
      if (str.split('.').length === 2) {
        str = str.split('.')[1];
        if (parseInt(str.split('E')[0]) !== 0) {
          isDecimal = true;
        }
      }
      const x = str.split('E');
      if (isDecimal) {
        len = x[0].length;
      }
      len -= parseInt(x[1]);
    } else if (str.split('.').length === 2) {
      // decimal
      if (parseInt(str.split('.')[1]) !== 0) {
        len = str.split('.')[1].length;
      }
    }
  } catch (e) {
    throw e;
  } finally {
    if (isNaN(len) || len < 0) {
      len = 0;
    }
    // eslint-disable-next-line
    return len;
  }
};

const convertToInt = function (num) {
  num = Number(num);
  let newNum = num;
  const times = countDecimals(num);
  const temp_num = num.toString().toUpperCase();
  if (temp_num.split('E').length === 2) {
    newNum = Math.round(num * 10 ** times);
  } else {
    newNum = Number(temp_num.replace('.', ''));
  }
  return newNum;
};

function getCorrectResult(type, num1, num2, result) {
  let temp_result = 0;
  /* eslint-disable */
  switch (type) {
    case 'add':
      temp_result = num1 + num2;
      break;
    case 'sub':
      temp_result = num1 - num2;
      break;
    case 'div':
      temp_result = num1 / num2;
      break;
    case 'mul':
      temp_result = num1 * num2;
      break;
  } /* eslint-enable */
  if (Math.abs(result - temp_result) > 1) {
    return temp_result;
  }
  return result;
}

export function subtract(num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let dec1,
    dec2;
  try { dec1 = countDecimals(num1) + 1; } catch (e) { dec1 = 0; }
  try { dec2 = countDecimals(num2) + 1; } catch (e) { dec2 = 0; }
  const times = 10 ** Math.max(dec1, dec2);
  const result = Number((multiply(num1, times) - multiply(num2, times)) / times);
  return getCorrectResult('sub', num1, num2, result);
}

export function add(num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let dec1,
    dec2;
  try {
    dec1 = countDecimals(num1) + 1;
  } catch (e) {
    dec1 = 0;
  }
  try {
    dec2 = countDecimals(num2) + 1;
  } catch (e) {
    dec2 = 0;
  }
  const times = 10 ** Math.max(dec1, dec2);

  const result = (multiply(num1, times) + multiply(num2, times)) / times;
  return getCorrectResult('add', num1, num2, result);
}

export function divide(num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let t1 = 0,
    t2 = 0,
    dec1,
    dec2;
  try { t1 = countDecimals(num1); } catch (e) { console.log(e); }
  try { t2 = countDecimals(num2); } catch (e) { console.log(e); }
  dec1 = convertToInt(num1);
  dec2 = convertToInt(num2);
  const result = multiply((dec1 / dec2), 10 ** (t2 - t1));
  return getCorrectResult('div', num1, num2, result);
}

export function multiply(num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let times = 0;
  const s1 = num1.toString();
  const s2 = num2.toString();

  try {
    times += countDecimals(s1);
  } catch (e) {
    console.log(e);
  }
  try {
    times += countDecimals(s2);
  } catch (e) {
    console.log(e);
  }
  const result = (convertToInt(s1) * convertToInt(s2)) / 10 ** times;
  return getCorrectResult('mul', num1, num2, result);
  // return result;
}
