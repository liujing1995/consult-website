stepUploader = new Vue({
    el: '#app2',
    data() {
        return {
            active: 1,
            testData: null,
            receivedData: {node:null, nodeNames: null},
            parseType: 'unstructured',
            idFieldName: null,
            titleFieldName: null,
            contentFieldName: null,
            parseTypeText: {
                unstructured: '非结构化数据',
                // unstructured_with_metadatas: '非结构化数据附带元数据（zip格式）',
                structured: '结构化数据（Excel、CSV格式)',
            },
            fileTotal: 0,
            fileCompleted: 0,
            file_ids: [],
            md5_file_ids_map: {},
            headers: layui.config.getAjaxHeadersJo(),
            options: {
                target: layui.config.base_server + layui.config.ms_samplelib_api + 'sampleLib/chunkUpload',
                headers: layui.config.getAjaxHeadersJo(),
                simultaneousUploads: 1,
                parseTimeRemaining: (timeRemaining, parsedTimeRemaining) => {
                    return parsedTimeRemaining
                        .replace(/\syears?/, '年')
                        .replace(/\sdays?/, '天')
                        .replace(/\shours?/, '小时')
                        .replace(/\sminutes?/, '分钟')
                        .replace(/\sseconds?/, '秒')
                },
                // 分片大小 5MB（minio 分片上传限制分片大小最小为 5MB）
                chunkSize: 1024 * 1024 * 5,
                // 开启分片上传检查, 分片上传前在后端进行检查
                testChunks: true,
                // 分片上传错误重试次数
                maxChunkRetries: 3,
                // 服务器分片校验函数, 秒传及断点续传基础
                checkChunkUploadedByResponse: function (chunk, message) {
                    let objMessage = JSON.parse(message);
                    // console.log(`服务器分片检查返回结果${message}`);
                    if (objMessage.skipUpload) {
                        return true;
                    }
                    return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
                },
            },
            attrs: {
                // accept: '.sig'
            },
            statusText: {
                success: '成功',
                error: '错误',
                uploading: '上传中',
                paused: '暂停中',
                waiting: '等待中'
            }
        };
    },
    mounted: function (){
        console.log(this)
        // layui.admin.putTempData("step2Uploader", this);
    },
    watch: {
        testData: function (mewValue, oldValue){
            let sampleLibCreate = this.testData; //layui
            // .admin.getTempData("sampleLibCreate");
            this.receivedData = {"node":sampleLibCreate, "nodeNames": sampleLibCreate.clsNamePath};
            if (!this.receivedData['node']){
                this.receivedData['node'] = {id: null};
            }
            if (!this.receivedData['nodeNames']){
                this.receivedData['nodeNames'] = [];
            }
        }
    },
    computed: {
        selectedParseTypeText() {
            return '选择上传类型：' + this.parseTypeText[this.parseType]
        },
        //Uploader实例
        uploader() {
            return this.$refs.uploader.uploader;
        },
        // receivedData() {
        //     // let receivedData = layui.admin.getLayerData('#app');
        //     var sampleLibCreate = this.testData; //layui.admin.getTempData("sampleLibCreate");
        //     var receivedData = {"node":sampleLibCreate, "nodeNames": sampleLibCreate.clsNamePath};
        //     // let receivedData = {
        //     //     "node": {
        //     //         "id": "f6092aeb4905be2b74c6dde1e8e1d94d",
        //     //         "name": "测试任务分配",
        //     //         "annotateType": "12",
        //     //         "annotateLabels": null,
        //     //         "memo": "测试任务分配",
        //     //         "createdTime": "2021-05-29 14:22:06",
        //     //         "createdUser": null,
        //     //         "bizClsId": "2c8fd79369688ab20edde74be624a6e1",
        //     //         "clsIdPath": "/2a0e50af3bf908c7333614ffbc6ecae2/ca372601ac2cf50bc46fa74c2dff0386/2c8fd79369688ab20edde74be624a6e1",
        //     //         "clsNamePath": "智慧审计/审计结果/审计底稿",
        //     //         "annotateTypeCn": "文本 / 文本实体提取",
        //     //         "annotateTypeFull": "1,12",
        //     //         "connectionLabels": null,
        //     //         "trainPercent": null,
        //     //         "orgId": "1169524075299999745",
        //     //         "orgName": "国家电网公司",
        //     //         "icon": "layui-icon  layui-icon-password",
        //     //         "updateTime": "2021-05-31 10:09:29",
        //     //         "viewCount": 0,
        //     //         "downloadCount": 0,
        //     //         "dataCount": 11,
        //     //         "score": 0.1,
        //     //         "markDataCount": 0,
        //     //         "validDataCount": 0,
        //     //         "labelDistribute": null,
        //     //         "tagsList": [
        //     //             {
        //     //                 "id": "a076ca1d330a2367b208aef5fa4bb195",
        //     //                 "labelName": "上海",
        //     //                 "createTime": "2021-05-25 15:04:07",
        //     //                 "updateTime": null
        //     //             }
        //     //         ],
        //     //         "labelIds": null,
        //     //         "labelNames": null,
        //     //         "annotatedCount": 0,
        //     //         "totalCount": 11,
        //     //         "annotatedPercent": "0%",
        //     //         "metaCount": 0,
        //     //         "labelsCount": null,
        //     //         "notIssuedCount": 11,
        //     //         "notCheckCount": 0,
        //     //         "annotateTaskCheckstatus": 0,
        //     //         "approvedCount": 0,
        //     //         "approvedPercent": "0%"
        //     //     },
        //     //     "nodeNames": "智慧审计/审计结果/审计底稿"
        //     // }
        //     if (!receivedData['node']){
        //         receivedData['node'] = {id: null};
        //     }
        //     if (!receivedData['nodeNames']){
        //         receivedData['nodeNames'] = [];
        //     }
        //     return receivedData;
        // },
        params() {
            return {
                sampleLibId: this.receivedData.node.id,
                treePath: this.receivedData.nodeNames,
                parseType: this.parseType,
                idFieldName: this.idFieldName,
                titleFieldName: this.titleFieldName,
                contentFieldName: this.contentFieldName
            }
        },
    },
    methods: {
        nextStep() {
            if (this.parseType === 'unstructured'){
                this.attrs = {}
            }
            // if (this.parseType === 'unstructured_with_metadatas'){
            //   this.attrs.accept = '.zip,.rar'
            // }
            if (this.parseType === 'structured'){
                if (this.idFieldName === null){
                    layui.admin.error("未指定主键ID列");
                    return;
                }
                if (this.titleFieldName === null) {
                    layui.admin.error("未指定标题列");
                    return;
                }
                if (this.contentFieldName === null) {
                    layui.admin.error("未指定内容列");
                    return;
                }
                this.attrs.accept = '.csv,.xls,.xlsx'
            }
            this.active ++;
        },
        //点击"选择上传文件"按钮
        onSelectFileButton() {
            if (this.$refs.uploadBtn) {
                layui.$('#global-uploader-btn').click();
            }
        },
        onFileAdded(file) {
            // console.log(`one file added, file.uniqueIdentifier=${file.uniqueIdentifier}`);
            file.ignored = this.file_ids.indexOf(file.uniqueIdentifier) >= 0
        },
        //选择上传文件时进行检查
        handleFilesAdded(files) {
            // console.log("files added:" + files.length)
        },
        //文件已经加入队列，开始计算md5并上传
        handleFilesSubmitted(files) {
            console.log("files submitted:" + files.length);
            for (let file of files) {
                this.fileTotal ++;
                this.file_ids.push(file.uniqueIdentifier);
                this.computeMD5(file);
            }
        },
        fileError(rootFile, file, message) {
            let response = JSON.parse(message);
            this.$message({
                message: `《${file.name}》: ${response.msg}`,
                type: 'error',
                duration: 6000
            });
        },
        onFileRemoved(file) {
            this.fileTotal --
            if (this.md5_file_ids_map[file.uniqueIdentifier]) {
                let fileId = this.md5_file_ids_map[file.uniqueIdentifier];
                this.file_ids.splice(this.file_ids.indexOf(fileId), 1)
            }
        },
        fileComplete() {
            this.fileCompleted ++
            // console.log('file complete', arguments)
        },
        complete() {
            layui.layer.msg('上传完成',{icon:1});
            // console.log('complete', arguments)
        },
        computeMD5(file) {
            let fileReader = new FileReader();
            let time = new Date().getTime();
            let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            let currentChunk = 0;
            const chunkSize = 10 * 1024 * 1000;
            let chunks = Math.ceil(file.size / chunkSize);
            let spark = new SparkMD5.ArrayBuffer();
            // 文件状态设为"计算MD5"
            this.statusSet(file.id, 'md5');
            file.pause();
            loadNext();
            fileReader.onload = (e => {
                spark.append(e.target.result);
                if (currentChunk < chunks) {
                    currentChunk++;
                    loadNext();
                    // 实时展示MD5的计算进度
                    this.$nextTick(() => {
                        layui.$(`.myStatus_${file.id}`).text('计算MD5值 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
                    })
                } else {
                    let md5 = spark.end();
                    this.computeMD5Success(md5, file);
                    // console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`);
                }
            });
            fileReader.onerror = function () {
                console.error(`文件${file.name}读取出错，请检查该文件`)
                file.cancel();
            };

            function loadNext() {
                let start = currentChunk * chunkSize;
                let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
            }
        },
        computeMD5Success(md5, file) {
            // 将自定义参数直接加载uploader实例的opts上
            Object.assign(this.uploader.opts, {
                query: {
                    ...this.params,
                }
            });
            this.md5_file_ids_map[md5] = file.uniqueIdentifier;
            file.uniqueIdentifier = md5;
            file.resume();
            this.statusRemove(file.id);
        },
        /**
         * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
         * @param id
         * @param status
         */
        statusSet(id, status) {
            let statusMap = {
                md5: {
                    text: '计算MD5值',
                    bgc: '#fff'
                },
                merging: {
                    text: '合并中',
                    bgc: '#e2eeff'
                },
                transcoding: {
                    text: '转码中',
                    bgc: '#e2eeff'
                },
                failed: {
                    text: '上传失败',
                    bgc: '#e2eeff'
                }
            };
            this.$nextTick(() => {
                let css = {
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'right': '0',
                    'bottom': '0',
                    'zIndex': '1',
                    'margin': '0',
                    'backgroundColor': statusMap[status].bgc
                };
                layui.$(`<p class="myStatus_${id}"></p>`).appendTo(`.file_${id} .uploader-file-status`).css(css).text(statusMap[status].text);
                layui.$(`<p class="myAction_${id}"></p>`).appendTo(`.file_${id} .uploader-file-actions`).css(css).text('');
            })
        },
        statusRemove(id) {
            this.$nextTick(() => {
                layui.$(`.myStatus_${id}`).remove();
                layui.$(`.myAction_${id}`).remove();
            })
        },
    }
})