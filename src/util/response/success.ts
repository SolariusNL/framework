class SuccessResponse {
  constructor(public message: string, public data: Record<string, unknown>) {
    this.message = message;
    this.data = data;
  }

  public toJSON() {
    return {
      success: true,
      message: this.message,
      data: this.data,
    };
  }
}

export default SuccessResponse;
