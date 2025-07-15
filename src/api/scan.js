import service from './axios'

//添加追踪器
export function addTrackers(data) {
  return service({
    url: `/tracker`,
    method: 'post',
    data,
  })
}
