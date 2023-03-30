interface IResponseBase<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default IResponseBase;
