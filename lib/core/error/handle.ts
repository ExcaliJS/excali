export class ExcaliCustomError extends Error
{
    public code: number
    public data: string|unknown[]|Record<string, unknown> 
    constructor(code: number, message: string, data: string|unknown[]|Record<string, unknown> = '')
    {
        super(message)
        this.code = code
        this.data = data
    }

    static BadRequest =  (message: string, data = ''): ExcaliCustomError =>
    {
        return new ExcaliCustomError(400, message, data)
    }

}
