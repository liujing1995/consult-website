// 名称必须为小写字母、数字、横线、点号，且必须以字母或数字开头，横线和点号不能结尾，长度为1-63位
var checkName = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('名称不能为空'));
    }
    let patt = new RegExp('^[a-z0-9]{1}[a-z0-9-.]*[^-.]$')
    if (!patt.test(value) && !/^[a-z0-9]{1}$/.test(value)){
        return callback(new Error('名称格式不正确。'));
    }
    if (value.length > 63) {
        return callback(new Error('长度为1-63位。'));
    }
    return callback()
};
// 英文、数字和下划线组成，不能以下划线开头，2-50个字符
var checkImageName = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('镜像名称不能为空'));
    }
    let patt = new RegExp('^[a-z0-9][a-z0-9_]*$')
    if (!patt.test(value)){
        return callback(new Error('英文小写字母、数字和下划线组成，不能以下划线开头。'));
    }
    if (value.length > 50 || value.length < 2) {
        return callback(new Error('长度为2-50个字符。'));
    }
    return callback()
};
// 中英文、数字和下划线组成，不能以下划线开头，2-50个字符
var checkModelName = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('模型名称不能为空'));
    }
    let patt = new RegExp('^[\u4E00-\u9FA5A-Za-z0-9][\u4E00-\u9FA5A-Za-z0-9_]*$')
    if (!patt.test(value)){
        return callback(new Error('中英文、数字和下划线组成，不能以下划线开头。'));
    }
    if (value.length > 50 || value.length < 2) {
        return callback(new Error('长度为2-50个字符。'));
    }
    return callback()
};
// 需要4位版本号，例如：1.0.0.0、2.1.1.1
var checkVersion = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('模型版本不能为空'));
    }
    let patt = new RegExp('^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$')
    if (!patt.test(value)){
        return callback(new Error('版本格式不正确。'));
    }
    return callback()
};

var validateDockerfile = (rule, value, callback) => {
    if (!value) {
        return callback(new Error("请输入Dockerfile"));
    } else {
        if (value.length < 6 || value.indexOf("from ") != 0) {
            return callback(new Error("首行需引入基础镜像信息，格式为from+空格+镜像，示例：from centos"));
        }
        callback();
    }
};