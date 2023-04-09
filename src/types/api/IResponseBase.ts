interface IResponseBase<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export default IResponseBase;
