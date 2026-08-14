class ThrowError extends Error{
    constructor(msg='Error interno', statusCode = 500, code ,data = {}){
        super(msg);
        this.statusCode = statusCode;
        this.code = code;
        this.data = data;
    }
}

module.exports = {
    ThrowError
}