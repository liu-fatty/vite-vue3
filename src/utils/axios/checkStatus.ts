import type { ErrorMessageMode } from '/#/axios';
import { useMessage } from '/@/hooks/useMessage';
import { useUserStore } from '/@/store/modules/user';

const { createMessage, createErrorModal } = useMessage();

enum codeEums {
  errMsg401 = '用户没有权限（令牌、用户名、密码错误）!',
  errMsg403 = '用户得到授权，但是访问是被禁止的。!',
  errMsg404 = '网络请求错误,未找到该资源!',
  errMsg405 = '网络请求错误,请求方法未允许!',
  errMsg408 = '网络请求超时!',
  errMsg500 = '服务器错误,请联系管理员!',
  errMsg501 = '网络未实现!',
  errMsg502 = '网络错误!',
  errMsg503 = '服务不可用，服务器暂时过载或维护!',
  errMsg504 = '网络超时!',
  errMsg505 = 'http版本不支持该请求!',
}

export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
): void {
  const userStore = useUserStore();
  let errMessage = '';

  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;
    case 401:
      // 如果未登录，则跳转到登录页面，并携带当前页面的路径
      errMessage = msg || codeEums.errMsg401;
      userStore.logout(true);
      break;
    case 403:
      errMessage = codeEums.errMsg403;
      break;
    // 404请求不存在
    case 404:
      errMessage = codeEums.errMsg404;
      break;
    case 405:
      errMessage = codeEums.errMsg405;
      break;
    case 408:
      errMessage = codeEums.errMsg408;
      break;
    case 500:
      errMessage = codeEums.errMsg500;
      break;
    case 501:
      errMessage = codeEums.errMsg501;
      break;
    case 502:
      errMessage = codeEums.errMsg502;
      break;
    case 503:
      errMessage = codeEums.errMsg503;
      break;
    case 504:
      errMessage = codeEums.errMsg504;
      break;
    case 505:
      errMessage = codeEums.errMsg505;
      break;
    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      createErrorModal({ title: '错误提示', content: errMessage });
    } else if (errorMessageMode === 'message') {
      createMessage.error({ content: errMessage, key: `global_error_message_status_${status}` });
    }
  }
}
