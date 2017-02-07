(function() {
    "use strict";

    angular.module('eolinker.directive')
    /* wangEditor指令 */
    .directive("wangEditor", ['$timeout', 'Api', 'CODE',function($timeout, Api, CODE){
        return {
            restrict: 'AE',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                var token = {
                    uptoken: '',
                    key: ''
                };
                var timer=null;

                function printLog(title, info) {
                    window.console && console.log(title, info);
                }

                // 初始化七牛上传
                function uploadInit() {
                    // this 即 editor 对象
                    var editor = this;
                    // 触发选择文件的按钮的id
                    var btnId = editor.customUploadBtnId;
                    // 触发选择文件的按钮的父容器的id
                    var containerId = editor.customUploadContainerId;

                    // 创建上传对象
                    var uploader = Qiniu.uploader({
                        runtimes: 'html5,flash,html4', //上传模式,依次退化
                        browse_button: btnId, //上传选择的点选按钮，**必需**
                        //uptoken_url: '/uptoken',
                        //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                        // uptoken : '<Your upload token>',
                        //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                        // unique_names: true,
                        // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
                        // save_key: true,
                        // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
                        uptoken_func: function(file) { // 在需要获取uptoken时，该方法会被调用
                            return token.uptoken;
                        },
                        get_new_uptoken: true,
                        domain: 'http://of8l7asfi.bkt.clouddn.com/',
                        //bucket 域名，下载资源时用到，**必需**
                        container: containerId, //上传区域DOM ID，默认是browser_button的父元素，
                        max_file_size: '100mb', //最大文件体积限制
                        //flash_swf_url: '../js/plupload/Moxie.swf', //引入flash,相对路径
                        filters: {
                            mime_types: [
                                //只允许上传图片文件 （注意，extensions中，逗号后面不要加空格）
                                { title: "图片文件", extensions: "jpg,gif,png,bmp" }
                            ]
                        },
                        max_retries: 0, //上传失败最大重试次数 
                        dragdrop: true, //开启可拖曳上传
                        drop_element: 'editor-container', //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                        chunk_size: '4mb', //分块上传时，每片的体积
                        //auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                        init: {
                            'FilesAdded': function(up, files) {
                                plupload.each(files, function(file) {
                                    // 文件添加进队列后,处理相关的事情
                                    Api.File.Post({ 'fileName': file.name, 'fileSize': file.size }).$promise.then(function(data) {
                                        if (data.statusCode == CODE.SUCCESS) {
                                            token.uptoken = data.token;
                                            token.key = data.fileKey + file.name;
                                            uploader.start();
                                        }
                                    })
                                    printLog('on FilesAdded');
                                });
                            },
                            'BeforeUpload': function(up, file) {
                                // 每个文件上传前,处理相关的事情
                                printLog('on BeforeUpload');
                            },
                            'UploadProgress': function(up, file) {
                                // 显示进度条
                                editor.showUploadProgress(file.percent);
                            },
                            'FileUploaded': function(up, file, info) {
                                // 每个文件上传成功后,处理相关的事情
                                // 其中 info 是文件上传成功后，服务端返回的json，形式如
                                // {
                                //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                                //    "key": "gogopher.jpg"
                                //  }
                                printLog(info);
                                // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
                                var domain = up.getOption('domain');
                                var res = $.parseJSON(info);
                                var sourceLink = domain + res.key; //获取上传成功后的文件的Url

                                printLog(sourceLink);

                                // 插入图片到editor
                                editor.command(null, 'insertHtml', '<img src="' + sourceLink + '" style="max-width:100%;"/>')
                            },
                            'Error': function(up, err, errTip) {
                                //上传出错时,处理相关的事情
                                printLog('on Error');
                            },
                            'UploadComplete': function() {
                                //队列文件处理完毕后,处理相关的事情
                                printLog('on UploadComplete');

                                // 隐藏进度条
                                editor.hideUploadProgress();
                            },
                            // Key 函数如果有需要自行配置，无特殊需要请注释
                            //,
                            'Key': function(up, file) {
                                //     // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                                //     // 该配置必须要在 unique_names: false , save_key: false 时才生效
                                var key = token.key;
                                //     // do something with key here
                                console.log(key)
                                return key
                            }
                        }
                    });
                    // domain 为七牛空间（bucket)对应的域名，选择某个空间后，可通过"空间设置->基本设置->域名设置"查看获取
                    // uploader 为一个plupload对象，继承了所有plupload的方法，参考http://plupload.com/docs
                }
                var textarea = !!attrs.editId?document.getElementById(attrs.editId):document.getElementById('editor-js');
                var editor = new wangEditor(textarea);
                editor.config.menus = [
                    'source',
                    '|',
                    'bold',
                    'underline',
                    'italic',
                    'strikethrough',
                    'eraser',
                    '|',
                    '|',
                    '|',
                    'quote',
                    '|',
                    'fontsize',
                    'head',
                    'unorderlist',
                    'orderlist',
                    'alignleft',
                    'aligncenter',
                    'alignright',
                    '|',
                    'link',
                    'unlink',
                    'table',
                    '|',
                    //'img',
                    'insertcode',
                    '|',
                    'undo',
                    'redo'
                ];
                //editor.config.customUpload = true; // 设置自定义上传的开关
                //editor.config.customUploadInit = uploadInit; // 配置自定义上传初始化事件，uploadInit方法在上面定义了
                editor.config.menuFixed = false;
                editor.create();
                scope.$on('$stateChangeStart', function() {// 路由状态开始改变时编辑器销毁
                    editor.destroy();
                })
                if (ngModel) {
                    ngModel.$render = function() {// ngModel.$render值发生变化时函数
                        try {
                            if(!!ngModel.$viewValue){
                                editor.$txt.html(ngModel.$viewValue);
                            }else{
                                ngModel.$setViewValue("<p><br></p>");
                            }
                        } catch (e) {

                        }
                    };
                    editor.onchange = function() {// 变化监听处理
                        timer=$timeout(function() {
                            ngModel.$setViewValue(editor.$txt.html());
                        }, 0, true)
                    };
                }
                scope.$on('$destroy', function() {// 页面跳转触发事件
                    if(timer){
                        $timeout.cancel(timer);
                    }
                });
            }
        }
    }]);

})();
