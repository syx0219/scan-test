import service from './axios'

//登录
export function loginUser(data) {
  return service({
    url: `/auth/login`,
    method: 'post',
    data,
  })
}
