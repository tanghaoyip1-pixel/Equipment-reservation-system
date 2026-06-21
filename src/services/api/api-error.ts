export default class ApiError {
  statusCode: number
  message: string | null
  response: any

  constructor(statusCode: number, message: string | null, response: any) {
    this.statusCode = statusCode
    this.message = message
    this.response = response
  }
}
