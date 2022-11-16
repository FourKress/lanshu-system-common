/**
 * 验证方法的提供
 */

import { getFileType, isNull } from '.';
import { MAP_FILE_TYPE } from './map';

/**
 * 验证文件类型
 * @param  {array} files
 * @param  {string[]} fileType
 * @returns {number} 返回第一个不符合的fileIndex，全部符合则返回-1
 */
export function validateFileType(files, fileType = MAP_FILE_TYPE.image) {
  let index = -1;
  files.some((file, i) => {
    // 如果检测不存在，则中断
    const notExist = !fileType.includes(getFileType(file.name));
    if (notExist) index = i;
    return notExist;
  });
  return index;
}

/**
 * 验证文件大小
 * @param  {Array} files
 * @param  {number} maxSize 单位是M
 * @returns {number} 返回第一个不符合大小的fileIndex，全部符合则返回-1
 */
export function validateFileSize(files, maxSize = 5) {
  let res = -1;
  files.some((file, index) => {
    if (!isNull(file.size) && maxSize * 1024 * 1024 < file.size) {
      res = index;
      return true;
    }
    return false;
  });
  return res;
}
