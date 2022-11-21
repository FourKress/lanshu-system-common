/**
 * 下载文件流、根据路径下载
 * type文件下载类型  type = url 后端返回的下载路径
 * */
// eslint-disable-next-line import/prefer-default-export
export function saveAs(blob, filename, type) {
  const link = document.createElement('a');
  link.href = type === 'url' ? blob : window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
}
