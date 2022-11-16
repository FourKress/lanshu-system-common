/* eslint-disable import/prefer-default-export */
/**
 * @function: 队列上传功能
 * @param(Array): files 接收一个文件列表
 * @param(Object): options 接收设置axios的参数
 *                {
 *                    url: 'url',
 *                    method: 'POST',
 *                    timeout: 100000000,
 *                    ...
 *                    params: {} //上传时额外携带的参数
 *                }
 * @return: 返回一个promise
 * promise(({ status, successFiles, failedFiles }) => {
 *  status: true表示全部上传成功，false表示全部失败或者部分失败
 *  successFiles: 上传成功的文件
 *  failedFiles: 上传失败的文件
 * }).catch(error => {
 *  报错或者服务错误
 * })
 *
 * */

import axios from './https';

const UPLOAD_URL = 'file/upload';
const OPTIONS = {
  url: UPLOAD_URL,
  method: 'POST',
  timeout: 100000000,
  name: 'file',
};

export function uploadQueue(files, options = {}) {
  const _options = { ...OPTIONS, ...options };
  const { params } = _options;
  const uploadTask = [];
  files.map((file) => {
    const formData = new FormData();
    formData.append(_options.name, file.raw || file); // 添加图片信息的参数
    // 额外参数
    params && Object.keys(params).map((k) => {
      formData.append(k, params[k]);
    });
    _options.data = formData;
    delete _options.params;
    uploadTask.push(axios(_options));
  });
  return new Promise((resolve, reject) => {
    Promise.all(uploadTask).then((responses) => {
      const successFiles = [];
      const failedFiles = [];
      responses.map((response, index) => {
        if (response.code === 10000) {
          successFiles.push(response.data);
        } else {
          failedFiles.push({ ...response, _file: files[index] });
        }
      });
      if (successFiles.length === responses.length) {
        // resolve与reject只能接受一个参数，所以在外面用解构的形式接受
        // 全部成功
        resolve({ status: true, successFiles });
      } else {
        // 部分失败或全部失败
        resolve({ status: false, failedFiles, successFiles });
      }
    }, (error) => {
      console.error('error===>', error);
      reject(error);
    });
  });
}
